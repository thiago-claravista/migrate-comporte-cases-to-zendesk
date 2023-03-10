require("dotenv").config();
const getAccount = require("../comporte/getAccount");
const getAttachments = require("../comporte/getAttachments");
const getCaseComments = require("../comporte/getCaseComments");
const getCaseFeeds = require("../comporte/getCaseFeeds");
const getCaseFeedItems = require("../comporte/getCaseFeedItems");
const getSurvey = require("../comporte/getSurvey");
const createTicket = require("../zendesk/createTicket");
const createUser = require("../zendesk/createUser");
const getUser = require("../zendesk/getUser");
const updateTicket = require("../zendesk/updateTicket");
const uploadFile = require("../zendesk/uploadFile");
const getAttachmentFile = require("./getAttachmentFile");
const localeDateString = require("./localeDateString");
const fillSubReasonFields = require("./fillSubReasonFields");
const getSubReason = require("./getSubReason");
const cleanString = require("./cleanString");
const fillRefundValueFields = require("./fillRefundValueFields");
const getRefundNeed = require("./getRefundNeed");
const statusRelation = require("../fieldValueRelation/status.json");
const priorityRelation = require("../fieldValueRelation/priority.json");
const originRelation = require("../fieldValueRelation/origin.json");
const salesforceReload = process.env.SALESFORCE_RELOAD === "1";
const salesforceRetroactive = process.env.SALESFORCE_RELOAD === "2";

const sendCaseToZendesk = async (_case) => {
  const status = statusRelation[_case.STATUS];
  const priority = priorityRelation[_case.PRIORITY] || "normal";
  const origin = originRelation[_case.ORIGIN];
  const subReason = getSubReason(_case.TYPE, _case.SUBJECT);
  const needRefund = getRefundNeed(subReason);

  // buscar o usuario na zendesk
  const email =
    _case.CONTACTEMAIL || `${_case.ACCOUNTID || _case.ID}@dummyemail.com`;
  const keyValueParam = `email:${encodeURIComponent(email)}`;
  const [requestedUser] = await getUser(keyValueParam);
  let user = requestedUser;

  const account = _case.ACCOUNTID && (await getAccount(_case.ACCOUNTID));
  if (!user) {
    const [key, value] = keyValueParam.split(":"); // email usado na busca

    const userData = {
      user: {
        name: account?.NAME || email,
        [key]: decodeURIComponent(value),
        identities: [
          {
            type: key,
            value: decodeURIComponent(value),
          },
        ],
        verified: true,
      },
    };

    console.log(`Criando usu??rio para o caso ${_case.ID}...`);
    const createdUser = await createUser(userData);
    user = createdUser.user;
    console.log(`Usu??rio criado com sucesso (${user.id})!`);
  }
  // console.log(`Usu??rio encontrado na Zendesk (${user.id}).`);

  // obter a resposta da pesquisa de satisfa????o
  let surveyAnswer;
  if (_case.PESQUISASATISFACAO__C) {
    // obter a resposta da pesquisa de satisfa????o
    const [survey] = await getSurvey(_case.PESQUISASATISFACAO__C);
    surveyAnswer = survey?.RESPOSTA__C;
  }

  // payload do ticket
  const payload = {
    ticket: {
      requester_id: user.id,
      submitter_id: user.id,
      subject: String(salesforceReload ? "[RECARGA] " : "").concat(
        _case.SUBJECT || "[SEM ASSUNTO]"
      ),
      status,
      priority,
      tags: [
        "salesforce",
        "tickets_salesforce",
        salesforceReload ? "salesforce_reload" : "",
        salesforceRetroactive ? "salesforce_retroactive" : "",
      ],
      description: _case.DESCRIPTION,
      comment: {
        html_body:
          _case.DESCRIPTION || _case.COMENTARIOINTERNO__C || "[SEM INTERA????O]",
        author_id: user.id,
        public: false,
      },
      custom_fields: [
        {
          id: 12341936126356, // Ag??ncia / Garagem (Texto)
          value: _case.AGENCIAGARAGEM__C || "",
        },
        {
          id: 12162754073108, // Ag??ncia
          value: _case.AGENCIA_BANCARIA__C || "",
        },
        {
          id: 12221738727444, // Banco
          value: "banco_" + cleanString(_case.BANCO__C),
        },
        {
          id: 12221520946324, // Banco do cart??o
          value: "banco_cartao_" + cleanString(_case.BANCO_DO_CARTAO__C),
        },
        {
          id: 12221561692948, // Bandeira do cart??o
          value: "bandeira_cartao_" + cleanString(_case.BANDEIRA_DO_CARTAO__C),
        },
        {
          id: 12333105664020, // CPF / CNPJ Pagador
          value: Number(account?.CNPJCPF__C?.replace(/\D/g, "")) || "",
        },
        {
          id: 12163118490900, // CPF do portador
          value: account?.CNPJCPF__C || "",
        },
        {
          id: 12163119992980, // CPF do portador (Pix)
          value: account?.CNPJCPF__C || "",
        },
        {
          id: 12221731622036, // Canal
          value: _case.CANAL__C?.toLowerCase() || "",
        },
        {
          id: 12221959936148, // Case Reason
          value: "case_reason_" + _case.REASON?.toLowerCase() || "",
        },
        {
          id: 12222334629524, // Categoria
          value: "categoria_" + cleanString(_case.CATEGORIA__C),
        },
        {
          id: 12163022396052, // Changed Status
          value: _case.CHANGED_STATUS__C === "true",
        },
        {
          id: 12163027133972, // Conta
          value: _case.CONTA_BANCARIA__C || "",
        },
        {
          id: 12218721684884, // Contact Email
          value: _case.CONTACTEMAIL || "",
        },
        {
          id: 12218680322964, // Contact Fax
          value: Number(_case.CONTACTFAX?.replace(/\D/g, "")) || "",
        },
        {
          id: 12218698327188, // Contact Mobile
          value: Number(_case.CONTACTMOBILE?.replace(/\D/g, "")) || "",
        },
        {
          id: 12218684018196, // Contact Phone
          value: Number(_case.CONTACTPHONE?.replace(/\D/g, "")) || "",
        },
        {
          id: 12163061482004, // ContactWebEmail
          value: _case.CONTACTWEBEMAIL__C || "",
        },
        {
          id: 12163113196820, // ContactWebName
          value: _case.CONTACTWEBNAME__C || "",
        },
        {
          id: 12163115898772, // ContactWebTelefone
          value: Number(_case.CONTACTWEBTELEFONE__C?.replace(/\D/g, "")) || "",
        },
        {
          id: 12163120760212, // Criado por mim
          value: _case.CRIADOPORMIM__C === "true",
        },
        {
          id: 12215081363092, // Data da Viagem
          value: _case.DATAHORAVIAGEM__C?.slice(0, 10) || "",
        },
        {
          id: 12163124336148, // Data da compra
          value: _case.DATA_DA_COMPRA_CARTAO__C?.slice(0, 10) || "",
        },
        {
          id: 12163187405076, // Data da compra (Pix)
          value: _case.DATA_DA_COMPRA_PIX__C?.slice(0, 10) || "",
        },
        ...(needRefund ? fillRefundValueFields("sim", subReason) : []), // Devolu????o de valor
        {
          id: 12215583745300, // D??gitos do cart??o
          value: _case.DIGITOS_DO_CARTAO__C || "",
        },
        {
          id: 12215583745300, // D??gitos do cart??o
          value: _case.DIGITOS_DO_CARTAO__C || "",
        },
        {
          id: 12215788802836, // EC
          value: _case.EC__C || "",
        },
        {
          id: 12215588342292, // E-mail do cadastro
          value: _case.E_MAIL_DO_CADASTRO__C || "",
        },
        {
          id: 12215666652820, // E-mail do cadastro (Pix)
          value: _case.E_MAIL_DO_CADASTRO_PIX__C || "",
        },
        {
          id: 12222812145044, // Empresa do Grupo - LGPD
          value: "empresa_do_grupo_lgpd_" + cleanString(_case.EMPRESAGRUPO__C),
        },
        {
          id: 12333231287828, // Empresa do Grupo Encomendas
          value:
            "empresa_do_grupo_encomendas_" + cleanString(_case.EMPRESAGRUPO__C),
        },
        {
          id: 12333174578452, // Empresa do Grupo Rodovi??rio
          value:
            "empresa_do_grupo_rodoviario_" + cleanString(_case.EMPRESAGRUPO__C),
        },
        {
          id: 12215886361876, // FarolSLA
          value: Number(_case.FAROLSLA__C) || 0,
        },
        {
          id: 12222854674324, // Forma de pagamento
          value: _case.FORMA_DE_PAGAMENTO__C || "",
        },
        {
          id: 12215868337044, // ID Reclame Aqui
          value: _case.IDRECLAMEAQUI__C || "",
        },
        {
          id: 12831628720532, // ID Salesforce
          value: _case.ID || "",
        },
        {
          id: 12215890044180, // Linha
          value: _case.LINHA__C || "",
        },
        {
          id: 12215920774164, // Localizador
          value: _case.LOCALIZADOR__C || "",
        },
        {
          id: 12222940921620, // M??dias Sociais
          value: "midias_sociais_" + cleanString(_case.MIDIASSOCIAIS__C),
        },
        {
          id: 12224028107924, // Motivo
          value: "motivo_" + cleanString(_case.TYPE),
        },
        {
          id: 12398445283348, // Motivo - Encomendas
          value: "encomendas_" + cleanString(_case.TYPE),
        },
        {
          id: 12399916522900, // Motivo - LGPD
          value: "lgpd_" + cleanString(_case.TYPE),
        },
        {
          id: 12398945520788, // Motivo - Rodovi??rio
          value: "rodovi??rio_" + cleanString(_case.TYPE),
        },
        {
          id: 12218881082900, // N?? Cota????o/ Coleta
          value: _case.N_COTACAO_COLETA__C || "",
        },
        {
          id: 13440909336468, // N??mero do Caso Salesforce
          value: _case.CASENUMBER || "",
        },
        {
          id: 12218880500244, // Nota de Avalia????o RA
          value: _case.NOTARA__C || "",
        },
        {
          id: 12218881676308, // N??mero da Passagem
          value: _case.TICKETNUMBER__C || "",
        },
        {
          id: 12223066275604, // Opera????o
          value: "operacao_" + _case.OPERACAO__C,
        },
        {
          id: 12224413992212, // ??rg??os Concedentes
          value:
            "orgaos_concedentes_" + _case.ORGAOS_CONCEDENTES__C?.toLowerCase(),
        },
        {
          id: 12649230222484, // Origem / Destino (Texto)
          value: _case.ORIGEMDESTINO__C || "",
        },
        {
          id: 12221883510420, // Origem do Chamado
          value: origin || "",
        },
        {
          id: 12485946923028, // Pesquisa de satifa????o - Chat
          value: `pesquisa_${surveyAnswer?.toLowerCase()}`,
        },
        {
          id: 12223063494548, // Planilha Pix
          value: _case.PLANILHA_PIX__C?.toLowerCase() || "",
        },
        {
          id: 12218899503508, // Portador do cart??o
          value: _case.PORTADOR_DO_CARTAO__C || "",
        },
        {
          id: 12223210547604, // Reten????o de 5% (Pix)
          value:
            _case.PROCEDENTE__C === "Sim" ? "procedente_sim" : "procedente_nao",
        },
        {
          id: 12220721549460, // Protocolo ??rg??os Reguladores
          value: _case.PROTOCOLOORGAOSREGULADORES__C || "",
        },
        {
          id: 13590980506900, // Recarga Salesforce
          value: salesforceReload ? "salesforce_reload" : "",
        },
        {
          id: 12312392260500, // Respons??vel 1
          value: cleanString(_case.RESPONSAVEL_1__C),
        },
        {
          id: 12312445984404, // Respons??vel 2
          value: cleanString(_case.RESPONSAVEL_2__C),
        },
        {
          id: 12312466858132, // Respons??vel 3
          value: cleanString(_case.RESPONSAVEL_3__C),
        },
        {
          id: 12312453256980, // Respons??vel 4
          value: cleanString(_case.RESPONSAVEL_4__C),
        },
        {
          id: 12312508722708, // Respons??vel 5
          value: cleanString(_case.RESPONSAVEL_5__C),
        },
        {
          id: 12312529297940, // Respons??vel 6
          value: cleanString(_case.RESPONSAVEL_6__C),
        },
        {
          id: 12223696617108, // Reten????o de 5% (Pix)
          value:
            _case.RETENCAO_DE_5_PIX__C === "Sim"
              ? "retencao_pix_sim"
              : "retencao_pix_nao",
        },
        {
          id: 12223423971988, // Reten????o de 5%
          value:
            _case.RETENCAO_DE_PORCENTAGEM__C === "Sim"
              ? "retencao_sim"
              : "retencao_nao",
        },
        {
          id: 12223794721940, // Site de Origem
          value: _case.SITE_DE_ORIGEM__C || "",
        },
        ...fillSubReasonFields(subReason), // Sub - Motivo(s)
        {
          id: 12224131666068, // Tipo de Cart??o
          value: _case.TIPO_DE_CARTAO__C?.toLowerCase() || "",
        },
        {
          id: 12224117528980, // Tipo de Conta
          value: cleanString(_case.TIPO_DE_CONTA__C),
        },
        {
          id: 12224135589780, // Titular da conta
          value: _case.TITULAR_DA_CONTA__C || "",
        },
        {
          id: 12692148486036, // Valor a reembolsar
          value: Number(_case.VALOR_A_REEMBOLSAR__C) || 0,
        },
        {
          id: 12817151366548, // Valor a reembolsar (Pix)
          value: Number(_case.VALOR_A_REEMBOLSAR_PIX__C) || 0,
        },
        {
          id: 12729906834964, // Valor da devolu????o
          value: Number(_case.VALOR_DA_DEVOLUCAO__C) || 0,
        },
        {
          id: 12692143720212, // Valor total da compra
          value: Number(_case.VALOR_TOTAL_COMPRA__C) || 0,
        },
        {
          id: 12817195321108, // Valor total da compra (Pix)
          value: Number(_case.VALOR_TOTAL_DA_COMPRA_PIX__C) || 0,
        },
      ],
    },
  };

  // cria o ticket na zendesk
  const ticket = await createTicket(payload);

  console.log(
    `Caso ${_case.ID} criado na Zendesk! ID ${ticket.id}; Status '${payload.ticket.status}'`
  );

  const updatePayload = {
    ticket: {
      comment: {
        html_body: `<b>Anexos</b>`,
        author_id: user.id,
        public: false,
      },
    },
  };

  // obter comentarios do caso
  const comments = await getCaseComments(_case.ID);
  if (comments.length) {
    // atualizar o ticket com os comentarios
    console.log("Inserindo coment??rios...");
    for (const comment of comments) {
      if (!comment.CommentBody) continue;

      const date = localeDateString(comment.CreatedDate);
      updatePayload.ticket.comment.html_body = `<small><i>[${date}]</i></small><p>${comment.CommentBody}</p>`;
      await updateTicket(updatePayload, ticket.id);
    }
    console.log("Coment??rios inseridos!");
  }

  // obter feed
  const feeds = await getCaseFeeds(_case.ID);
  if (feeds.length) {
    // atualizar o ticket com os feeds
    console.log("Inserindo feeds...");
    for (const feed of feeds) {
      if (!feed.COMMENTBODY) continue;

      const date = localeDateString(feed.CREATEDDATE);
      updatePayload.ticket.comment.html_body = `<small><i>[${date}]</i></small><p>${feed.COMMENTBODY}</p>`;
      await updateTicket(updatePayload, ticket.id);
    }
    console.log("Feeds inseridos!");
  }

  // obter feedItems
  const feedItems = await getCaseFeedItems(_case.ID);
  if (feedItems.length) {
    // atualizar o ticket com os feedItems
    let concatBody = "";
    console.log("Inserindo feedItems...");

    for (let i = 0; i < feedItems.length; i++) {
      const feedItem = feedItems[i];

      if (!feedItem.BODY) continue;

      if (feedItems.length >= 30) {
        concatBody += `<p>${feedItem.BODY}</p><br>`;
        if (i < feedItems.length - 1) continue;

        updatePayload.ticket.comment.html_body = concatBody;
      } else {
        updatePayload.ticket.comment.html_body = `<p>${feedItem.BODY}</p>`;
      }

      await updateTicket(updatePayload, ticket.id);
    }
    console.log("FeedItems inseridos!");
  }

  // obter anexos
  const attachments = await getAttachments(_case.ID);
  if (attachments.length) {
    // atualizar o ticket com os anexos
    console.log("Inserindo anexos...");
    const uploads = [];
    for (const attachment of attachments) {
      // console.log(attachment);
      const file = getAttachmentFile(attachment.Id);

      if (file) {
        const upload = await uploadFile(
          `${attachment.Id}.${attachment.FileType}`,
          file
        );

        if (upload.token) {
          uploads.push(upload.token);
        }
      }
    }

    if (uploads.length) {
      updatePayload.ticket.comment.html_body = `<b>Anexos</b>`;
      updatePayload.ticket.comment.uploads = uploads;
      await updateTicket(updatePayload, ticket.id);
    }
    console.log("Anexos inseridos!");
  }

  if (_case.STATUS === "Encerrado") {
    // fechar o ticket na zendesk
    await updateTicket(
      {
        ticket: {
          status: "closed",
        },
      },
      ticket.id
    );
    console.log(`Ticket ${ticket.id} fechado na Zendesk!`);
  }

  return ticket.id;
};

module.exports = sendCaseToZendesk;
