import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();

export const handler = async (values) => {
  // Dados a serem salvos no DynamoDB
  const params = {
    TableName: "emails",
    Item: {
      id: uuidv4(),
      ...values,
      submittedAt: new Date().toISOString(),
    },
  };

  const emailParams = {
    Destination: {
      ToAddresses: ["vabsbc@gmail.com"], // substitua com o endereço de destino
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          // Aqui você define o conteúdo HTML
          Data: EmailTemplate(values).html,
        },
      },
      Subject: { Data: EmailTemplate(values).subject },
    },
    Source: "vinicius.ab@hotmail.com", // substitua com um endereço de e-mail verificado pelo SES
  };

  try {
    // Salvar no DynamoDB
    await dynamoDb.put(params).promise();

    // Enviar email via SES
    await ses.sendEmail(emailParams).promise();

    return {
      status: true,
      message: "Dados enviado com sucesso.",
    };
  } catch (error) {
    return {
      status: false,
      message: "Erro ao tentar enviar os dados.",
      errorMessage: JSON.stringify(error),
    };
  }
};

export const EmailTemplate = (values) => {
  switch (values.type) {
    case "buy_less_than_100":
      return {
        subject: "ZCex - Compra de menos de 100 créditos",
        html: `
        <h1>Compra de menos de 100 créditos</h1>
        <p><strong>Quantidade:</strong> ${values.qty}</p>
        <p><strong>Origem e preço:</strong> ${values.source}</p>
        <p><strong>Nome:</strong> ${values.name}</p>
        <p><strong>Documento:</strong> ${values.document}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>Whatsapp:</strong> ${values.phone}</p>
      `,
      };
    case "buy_more_than_100":
      return {
        subject: "ZCex - Compra de mais de 100 créditos",
        html: `
        <h1>Compra de mais de 100 créditos</h1>
        <p><strong>Nome da organização:</strong> ${values.company_name}</p>
        <p><strong>Telefone Comercial:</strong> ${values.phone}</p>
        <p><strong>Site:</strong> ${values.website || "---"}</p>
        <p><strong>Nome:</strong> ${values.name}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>Telefone / Whatsapp:</strong> ${values.celphone || "---"}</p>
        <p><strong>Cargo:</strong> ${values.position || "---"}</p>
        <p><strong>Motivos para compra:</strong> ${values.reasons || "---"}</p>
        <p><strong>Estimativa de quantidade:</strong> ${
          values.qty_estimate || "---"
        }</p>
        <p><strong>Gostaria de realizar um inventario de emissoes de gee (gases do efeito estufa, incluindo o co2)?</strong> ${
          values.inventory || "---"
        }</p>
        <p><strong>Gostaria de realizar nossa consultoria para diminuir as emissões de gee (gases do efeito estufa, incluindo o co2)?</strong> ${
          values.consultancy || "---"
        }</p>
        <p><strong>Detalhes da organização e possível compra de créditos</strong> ${
          values.company_details || "---"
        }</p>
        `,
      };
    case "sell":
      return {
        subject: "ZCex - Venda de créditos",
        html: `
        <h1>Venda de créditos</h1>
        <p><strong>Nome da organização:</strong> ${values.company_name}</p>
        <p><strong>Nome:</strong> ${values.name}</p>
        <p><strong>Email:</strong> ${values.email}</p>
        <p><strong>Telefone:</strong> ${values.phone || "---"}</p>
        <p><strong>Cargo:</strong> ${values.position || "---"}</p>
        <p><strong>Tipos de projeto:</strong> ${
          values.types ? values.types.replace("|", ", ") : "---"
        }</p>
        <p><strong>Detalhes técnicos:</strong> ${values.details || "---"}</p>
      `,
      };
    default:
      break;
  }
};
