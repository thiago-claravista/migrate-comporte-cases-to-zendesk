require("dotenv").config();
const comporteBaseUrl = process.env.COMPORTE_BASE_URL;
const comporteToken = process.env.COMPORTE_TOKEN;
const zendeskBaseUrl = process.env.ZENDESK_BASE_URL;
const zendeskUser = process.env.ZENDESK_USER;
const zendeskPassword = process.env.ZENDESK_PASSWORD;
const zendesk_token = Buffer.from(`${zendeskUser}:${zendeskPassword}`).toString(
  "base64"
);

exports.GET_COMPORTE_CASES = (page = "", limit = "") => {
  return {
    url: `${comporteBaseUrl}/cases?page=${page}&limit=${limit}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_CASE = (caseId) => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_ACCOUNT = (accountId) => {
  return {
    url: `${comporteBaseUrl}/accounts/${accountId}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_CASE_COMMENTS = (caseId, page = "", limit = "") => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}/comments?page=${page}&limit=${limit}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_CASE_FEEDS = (caseId, page = "", limit = "") => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}/feeds?page=${page}&limit=${limit}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_CASE_FEED_ITEMS = (caseId, page = "", limit = "") => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}/feedItems?page=${page}&limit=${limit}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_CASE_ATTACHMENTS = (caseId, page = "", limit = "") => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}/attachments?page=${page}&limit=${limit}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.GET_COMPORTE_SURVEY = (id) => {
  return {
    url: `${comporteBaseUrl}/surveys/${id}`,
    headers: {
      Authorization: comporteToken,
    },
  };
};

exports.PUT_ZENDESK_ID_ON_CASE = (caseId) => {
  return {
    url: `${comporteBaseUrl}/cases/${caseId}/ticket`,
    headers: {
      Authorization: comporteToken,
      "Content-Type": "application/json",
    },
  };
};

exports.SEARCH_ZENDESK_TICKETS = (query) => {
  return {
    url: `${zendeskBaseUrl}/search.json?query=${encodeURIComponent(query)}`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
    },
  };
};

exports.GET_ZENDESK_USER = (keyValueParam) => {
  return {
    url: `${zendeskBaseUrl}/users/search.json?query=${keyValueParam}`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
    },
  };
};

exports.CREATE_ZENDESK_USER = () => {
  return {
    url: `${zendeskBaseUrl}/users`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
      "Content-Type": "application/json",
    },
  };
};

exports.CREATE_ZENDESK_TICKET = () => {
  return {
    url: `${zendeskBaseUrl}/tickets`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
      "Content-Type": "application/json",
    },
  };
};

exports.UPDATE_ZENDESK_TICKET = (ticketId) => {
  return {
    url: `${zendeskBaseUrl}/tickets/${ticketId}`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
      "Content-Type": "application/json",
    },
  };
};

exports.UPLOAD_ZENDESK_FILE = (filename, contentType) => {
  return {
    url: `${zendeskBaseUrl}/uploads?filename=${filename}`,
    headers: {
      Authorization: `Basic ${zendesk_token}`,
      "Content-Type": contentType,
    },
  };
};
