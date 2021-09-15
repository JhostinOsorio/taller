// Importar dependencias
const fs = require('fs');
const pem = require('pem');
const soap = require('soap');
const AdmZip = require('adm-zip')
const { SignedXml } = require('xml-crypto');

// Importar helpers
const { crearXmlFactura } = require('./helpers/createXml');

// Datos del comprobante
const comprobante = {
  tipoComprobante: '01',
  tipoOperacion: '0101',
  serie: 'F001',
  correlativo: '1',
  fechaEmision: '2021-09-02',
  horaEmision: '10:57:00',
  moneda: 'PEN',
  operacionesGravadas: 400.00,
  igv: 72.00,
  impuestoTotal: 72.00,
  importeTotal: 472.00,
};

// Datos del Emisor
const emisor = {
  tipoDocumento: '6',
  numeroDocumento: '10702670085',
  razonSocial: 'DEVELOPER TEC S.A.C.',
  nombreComercial: 'DEVELOPER TEC',
  ubigeo: '150509',
  departamento: 'LIMA',
  provincia: 'CAÑETE',
  distrito: 'MALA',
  direccion: 'PASAJE SAN JOSE S/N - MALA - CAÑETE - LIMA',
  pais: 'PE',
  usuarioSol: 'MODDATOS',
  claveSol: 'MODDATOS',
};

// Datos del Cliente
const cliente = {
  tipoDocumento: '6',
  numeroDocumento: '10702670075',
  razonSocial: 'TEC S.A.C.',
  direccion: 'LAS CASUARINAS S/N - SAN ANTONIO - CAÑETE - LIMA',
}

// Detalle
const detalle = [
  {
    codigo: '195',
    codigoSunat: '10191509',
    descripcion: 'FENA X L',
    unidadMedida: 'NIU',
    cantidad: 1,
    valorUnitario: 400.00,
    montoBaseIgv: 400.00,
    tipAfecIgv: '10',
    igv: 72.00,
    totalImpuestos: 72.00,
    valorVenta: 400.00,
    precioUnitario: 472.00,
  }
];

// Leyendas
const leyendas = [
  {
    codigo: '1000',
    valor: 'SON CUATROCIENTOS SETENTA Y DOS CON 00/100 SOLES',
  }
];

const pathCertificate = `./certificate/${emisor.numeroDocumento}.pfx`;
const pfxPassword = '123456';
const xml = crearXmlFactura(comprobante, emisor, cliente, detalle, leyendas);
const voucherName = `${emisor.numeroDocumento}-${comprobante.tipoComprobante}-${comprobante.serie}-${comprobante.correlativo}`;
const pathXml = `./storage/xml/${voucherName}.XML`;
const pathZip = `./storage/zip/${voucherName}.ZIP`;

// Función keyInfoProvider 
function KeyInfoProvider(pem) {
	return {
		getKeyInfo(key, prefix) {
      const cert = this.getCert();
      return `<ds:X509Data><ds:X509Certificate>${cert}</ds:X509Certificate></ds:X509Data>`;
		},
		getCert() {
      try {
        return pem.cert.replace('-----BEGIN CERTIFICATE-----', '').replace('-----END CERTIFICATE-----', '').replace(/\r\n/g, '')
      } catch (err) {
        throw Error(err);
		 	}
		}
	}
}

pem.readPkcs12(pathCertificate, { p12Password: pfxPassword }, (error, pem) => {
  if (error) {
    return console.log('Ocurrio un error al momento de leer el certificado');
  }

  // Crear instancia
  const sig = new SignedXml();

  // Ingresar las transformaciones y algoritmos para el firmado
  const xpath = `//*[local-name(.)='Invoice']`;
  const transforms = [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
  ];
  const digesthAlgorithm = 'http://www.w3.org/2000/09/xmldsig#sha1';

  sig.addReference(xpath, transforms, digesthAlgorithm, '', '', '', true);
  sig.signingKey = pem.key;
  sig.keyInfoProvider = new KeyInfoProvider(pem);
  sig.canonicalizationAlgorithm = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
  sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

  // Indicar opciones de firmado
  const opts = {
    prefix: 'ds',
    attrs: {
      Id: 'SignatureSP',
    },
    location: {
      reference: `//*[local-name(.)='ExtensionContent']`,
      action: 'append',
    },
  };

  // Firmar xml
  sig.computeSignature(xml, opts);

  // Guardar el xml
  const signedXML = sig.getSignedXml();
  fs.writeFileSync(pathXml, signedXML);

  // Zipear el XML Firmado
  const zip = new AdmZip();
  zip.addLocalFile(pathXml);
  zip.writeZip(pathZip);
  const database64 = fs.readFileSync(pathZip, { encoding: 'base64' });

  // Enviar el Comprobante a SUNAT
  const url = 'https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService?wsdl';
  const options = { forceSoap12Headers: false };
  soap.createClient(url, options, function(err, client) {
    const usuario = `${emisor.numeroDocumento}${emisor.usuarioSol}`;
    const clave = emisor;
    const wsSecurity = new soap.WSSecurity(usuario, clave, {})
    client.setSecurity(wsSecurity);
    client.sendBill({
        fileName: `${voucherName}.ZIP`,
        contentFile: database64
    },(err, res) => {
        if(err){
          console.log('Error:')
          console.log(err.response.data)
        }else{
            console.log(res);
        }
    });
  });
})
