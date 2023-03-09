/**
 * @param {String} value
 * @param {String} subReason
 * @returns {Array}
 */
const fillRefundValueFields = (value, subReason) => {
  const [reason] = subReason?.match(/(?<=rod_).+/g);
  const [plataform] = subReason?.match(/(?<=_)\w+(?=_rod)/g);

  const customField = [
    {
      id: 13262399207572,
      tag_prefix: "devolucao_valor_app_cobrança_indevida_",
    },
    {
      id: 13262401562260,
      tag_prefix: "devolucao_valor_app_erro_cancelamento_",
    },
    {
      id: 13262403608340,
      tag_prefix: "devolucao_valor_app_erro_estorno_",
    },
    {
      id: 13262420964116,
      tag_prefix: "devolucao_valor_app_erro_compra_",
    },
    {
      id: 13262459933076,
      tag_prefix: "devolucao_valor_app_não_gerou_voucher_",
    },
    {
      id: 13260558391956,
      tag_prefix: "devolucao_valor_site_cobrança_indevida_",
    },
    {
      id: 13260714651156,
      tag_prefix: "devolucao_valor_site_erro_cancelamento_",
    },
    {
      id: 13260830293396,
      tag_prefix: "devolucao_valor_site_erro_estorno_",
    },
    {
      id: 13260655275284,
      tag_prefix: "devolucao_valor_site_erro_compra_",
    },
    {
      id: 13261075730964,
      tag_prefix: "devolucao_valor_site_não_gerou_voucher_",
    },
  ];

  return customField
    .filter(({ tag_prefix }) => {
      return (
        tag_prefix.includes(plataform) &&
        tag_prefix.includes(reason.replace(/_de|_na/, ""))
      );
    })
    .map(({ id, tag_prefix }) => ({
      id,
      value: `${tag_prefix}${value}`,
    }));
};

module.exports = fillRefundValueFields;
