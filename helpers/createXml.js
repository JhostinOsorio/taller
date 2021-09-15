const crearXmlFactura = (comprobante, emisor, cliente, detalle, leyendas) => {
let xml = `<?xml version="1.0" encoding="utf-8"?>
<Invoice xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
<ext:UBLExtensions>
  <ext:UBLExtension>
    <ext:ExtensionContent/>
  </ext:UBLExtension>
</ext:UBLExtensions>
<cbc:UBLVersionID>2.1</cbc:UBLVersionID>
<cbc:CustomizationID>2.0</cbc:CustomizationID>
<cbc:ProfileID schemeName="Tipo de Operación" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo17">${comprobante.tipoOperacion}</cbc:ProfileID>
<cbc:ID>${comprobante.serie}-${comprobante.correlativo}</cbc:ID>
<cbc:IssueDate>${comprobante.fechaEmision}</cbc:IssueDate>
<cbc:IssueTime>${comprobante.horaEmision}</cbc:IssueTime>
<cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01" listID="${comprobante.tipoOperacion}" name="Tipo de Operacion">${comprobante.tipoComprobante}</cbc:InvoiceTypeCode>`;

if (leyendas.length) {
  leyendas.forEach(({ codigo, valor }) => {
    xml += `<cbc:Note languageLocaleID="${codigo}"><![CDATA[${valor}]]></cbc:Note>`
  });
}

xml += `<cbc:DocumentCurrencyCode listID="ISO 4217 Alpha" listName="Currency" listAgencyName="United Nations Economic Commission for Europe">${comprobante.moneda}</cbc:DocumentCurrencyCode>
<cbc:LineCountNumeric>${detalle.length}</cbc:LineCountNumeric>
<cac:Signature>
  <cbc:ID>${comprobante.serie}-${comprobante.correlativo}</cbc:ID>
  <cac:SignatoryParty>
    <cac:PartyIdentification>
      <cbc:ID>${emisor.numeroDocumento}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
      <cbc:Name><![CDATA[${emisor.razonSocial}]]></cbc:Name>
    </cac:PartyName>
  </cac:SignatoryParty>
  <cac:DigitalSignatureAttachment>
    <cac:ExternalReference>
      <cbc:URI>#SignatureSP</cbc:URI>
    </cac:ExternalReference>
  </cac:DigitalSignatureAttachment>
</cac:Signature>
<cac:AccountingSupplierParty>
  <cac:Party>
    <cac:PartyIdentification>
      <cbc:ID schemeID="${emisor.tipoDocumento}" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${emisor.numeroDocumento}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
      <cbc:Name><![CDATA[${emisor.nombreComercial}]]></cbc:Name>
    </cac:PartyName>
    <cac:PartyTaxScheme>
      <cbc:RegistrationName><![CDATA[${emisor.razonSocial}]]></cbc:RegistrationName>
      <cbc:CompanyID schemeID="${emisor.tipoDocumento}" schemeName="SUNAT:Identificador de Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${emisor.numeroDocumento}</cbc:CompanyID>
      <cac:TaxScheme>
        <cbc:ID schemeID="${emisor.tipoDocumento}" schemeName="SUNAT:Identificador de Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${emisor.numeroDocumento}</cbc:ID>
      </cac:TaxScheme>
    </cac:PartyTaxScheme>
    <cac:PartyLegalEntity>
      <cbc:RegistrationName><![CDATA[${emisor.razonSocial}]]></cbc:RegistrationName>
      <cac:RegistrationAddress>
        <cbc:ID schemeName="Ubigeos" schemeAgencyName="PE:INEI">${emisor.ubigeo}</cbc:ID>
        <cbc:AddressTypeCode listAgencyName="PE:SUNAT" listName="Establecimientos anexos">0000</cbc:AddressTypeCode>
        <cbc:CityName><![CDATA[${emisor.departamento}]]></cbc:CityName>
        <cbc:CountrySubentity><![CDATA[${emisor.provincia}]]></cbc:CountrySubentity>
        <cbc:District><![CDATA[${emisor.distrito}]]></cbc:District>
        <cac:AddressLine>
          <cbc:Line><![CDATA[${emisor.direccion}]]></cbc:Line>
        </cac:AddressLine>
        <cac:Country>
          <cbc:IdentificationCode listID="ISO 3166-1" listAgencyName="United Nations Economic Commission for Europe" listName="Country">${emisor.pais}</cbc:IdentificationCode>
        </cac:Country>
      </cac:RegistrationAddress>
    </cac:PartyLegalEntity>
    <cac:Contact>
      <cbc:Name><![CDATA[]]></cbc:Name>
    </cac:Contact>
  </cac:Party>
</cac:AccountingSupplierParty>
<cac:AccountingCustomerParty>
  <cac:Party>
    <cac:PartyIdentification>
      <cbc:ID schemeID="${cliente.tipoDocumento}" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${cliente.numeroDocumento}</cbc:ID>
    </cac:PartyIdentification>
    <cac:PartyName>
      <cbc:Name><![CDATA[${cliente.razonSocial}]]></cbc:Name>
    </cac:PartyName>
    <cac:PartyTaxScheme>
      <cbc:RegistrationName><![CDATA[${cliente.razonSocial}]]></cbc:RegistrationName>
      <cbc:CompanyID schemeID="${cliente.tipoDocumento}" schemeName="SUNAT:Identificador de Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${cliente.numeroDocumento}</cbc:CompanyID>
      <cac:TaxScheme>
        <cbc:ID schemeID="${cliente.tipoDocumento}" schemeName="SUNAT:Identificador de Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${cliente.numeroDocumento}</cbc:ID>
      </cac:TaxScheme>
    </cac:PartyTaxScheme>
    <cac:PartyLegalEntity>
      <cbc:RegistrationName><![CDATA[${cliente.razonSocial}]]></cbc:RegistrationName>
      <cac:RegistrationAddress>
        <cbc:ID schemeName="Ubigeos" schemeAgencyName="PE:INEI"/>
        <cbc:CityName><![CDATA[]]></cbc:CityName>
        <cbc:CountrySubentity><![CDATA[]]></cbc:CountrySubentity>
        <cbc:District><![CDATA[]]></cbc:District>
        <cac:AddressLine>
          <cbc:Line><![CDATA[${cliente.direccion}]]></cbc:Line>
        </cac:AddressLine>                                        
        <cac:Country>
          <cbc:IdentificationCode listID="ISO 3166-1" listAgencyName="United Nations Economic Commission for Europe" listName="Country"/>
        </cac:Country>
      </cac:RegistrationAddress>
    </cac:PartyLegalEntity>
  </cac:Party>
</cac:AccountingCustomerParty>
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="${comprobante.moneda}">${comprobante.impuestoTotal}</cbc:TaxAmount>
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="${comprobante.moneda}">${comprobante.operacionesGravadas}</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="${comprobante.moneda}">${comprobante.igv}</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID schemeID="UN/ECE 5305" schemeName="Tax Category Identifier" schemeAgencyName="United Nations Economic Commission for Europe">S</cbc:ID>
      <cac:TaxScheme>
        <cbc:ID schemeID="UN/ECE 5153" schemeAgencyID="6">1000</cbc:ID>
        <cbc:Name>IGV</cbc:Name>
        <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>			
</cac:TaxTotal>
<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount currencyID="${comprobante.moneda}">${comprobante.operacionesGravadas}</cbc:LineExtensionAmount>
  <cbc:TaxInclusiveAmount currencyID="${comprobante.moneda}">${comprobante.importeTotal}</cbc:TaxInclusiveAmount>
  <cbc:PayableAmount currencyID="${comprobante.moneda}">${comprobante.importeTotal}</cbc:PayableAmount>
</cac:LegalMonetaryTotal>`
for (let i = 0; i < detalle.length; i++) {
  xml += `
<cac:InvoiceLine>
  <cbc:ID>${i + 1}</cbc:ID>
  <cbc:InvoicedQuantity unitCode="${detalle[i].unidadMedida}" unitCodeListID="UN/ECE rec 20" unitCodeListAgencyName="United Nations Economic Commission for Europe">${detalle[i].cantidad}</cbc:InvoicedQuantity>
  <cbc:LineExtensionAmount currencyID="${comprobante.moneda}">${detalle[i].valorVenta}</cbc:LineExtensionAmount>
  <cac:PricingReference>
    <cac:AlternativeConditionPrice>
      <cbc:PriceAmount currencyID="${comprobante.moneda}">${detalle[i].precioUnitario}</cbc:PriceAmount>
      <cbc:PriceTypeCode listName="Tipo de Precio" listAgencyName="PE:SUNAT" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16">01</cbc:PriceTypeCode>
    </cac:AlternativeConditionPrice>
  </cac:PricingReference>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${comprobante.moneda}">${detalle[i].totalImpuestos}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${comprobante.moneda}">${detalle[i].montoBaseIgv}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${comprobante.moneda}">${detalle[i].igv}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID schemeID="UN/ECE 5305" schemeName="Tax Category Identifier" schemeAgencyName="United Nations Economic Commission for Europe">S</cbc:ID>
        <cbc:Percent>18</cbc:Percent>
        <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07">${detalle[i].tipAfecIgv}</cbc:TaxExemptionReasonCode>
        <cac:TaxScheme>
          <cbc:ID schemeID="UN/ECE 5153" schemeName="Codigo de tributos" schemeAgencyName="PE:SUNAT">1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
          <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal></cac:TaxTotal>
  <cac:Item>
    <cbc:Description><![CDATA[${detalle[i].descripcion}]]></cbc:Description>
    <cac:SellersItemIdentification>
      <cbc:ID><![CDATA[${detalle[i].codigo}]]></cbc:ID>
    </cac:SellersItemIdentification>
    <cac:CommodityClassification>
      <cbc:ItemClassificationCode listAgencyName="GS1 US" listID="UNSPSC" listName="Item Classification">${detalle[i].codigoSunat}</cbc:ItemClassificationCode>
    </cac:CommodityClassification>
  </cac:Item>
  <cac:Price>
    <cbc:PriceAmount currencyID="${comprobante.moneda}">${detalle[i].valorUnitario}</cbc:PriceAmount>
  </cac:Price>
</cac:InvoiceLine>
`
}

xml += `</Invoice>`
return xml;
}

module.exports = {
  crearXmlFactura,
}