// Map a JS object -> DB insert/update payload for integral.moitdlybulletin
exports.transToMoitdlybulletinDbData = (data, userId) => {
  return {
    news_date:     data.news_date     || null,
    bulletin_news: data.bulletin_news || null,

    create_id:     userId             || null,
    create_date:   new Date(),               // current timestamp
    update_id:     userId             || null,
    update_date:   new Date(),               // current timestamp
  };
};
