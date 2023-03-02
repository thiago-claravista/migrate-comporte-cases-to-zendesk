const getRefundNeed = (subReasons) => {
  const necessarySubReasons = [
    "sub_motivo_reclamação_site_rod_cobrança_indevida",
    "sub_motivo_reclamação_site_rod_erro_na_compra",
    "sub_motivo_reclamação_site_rod_não_gerou_voucher",
    "sub_motivo_reclamação_site_rod_erro_de_cancelamento",
    "sub_motivo_reclamação_site_rod_erro_de_estorno",
    "sub_motivo_reclamação_app_rod_cobrança_indevida",
    "sub_motivo_reclamação_app_rod_erro_na_compra",
    "sub_motivo_reclamação_app_rod_erro_de_cancelamento",
    "sub_motivo_reclamação_app_rod_erro_de_estorno",
    "sub_motivo_reclamação_app_rod_não_gerou_voucher",
  ];

  return necessarySubReasons.includes(subReasons);
};

module.exports = getRefundNeed;
