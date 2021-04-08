const getShop = (ctx, shop) => {
  let text = '<b>' + shop.name + '</b>';

  if(ctx.session.latitude && ctx.session.longitude){
    const distance = getDistanceFromLatLonInKm(ctx.session.latitude, ctx.session.longitude, shop.latitude, shop.longitude);
    text += ' - <i>' + distance.d + ' ' + distance.t + ' from you</i>';
  }

  let addres = [];
  if(shop.postcode) addres.push(shop.postcode);
  if(shop.country) addres.push(shop.country);
  if(shop.region) addres.push(shop.region);
  if(shop.provinces) addres.push(shop.provinces);
  if(shop.city) addres.push(shop.city);
  if(shop.address) addres.push(shop.address);
  if(addres.length) text += '\nAddress: ' + addres.join(', ');

  if(shop.telephone) text += '\nTelephone: ' + shop.telephone;
  if(shop.phone_number) text += '\nPhone: ' + shop.phone_number;
  if(shop.email) text += '\nEmail: ' + shop.email;

  const today = new Date();
  today.setDate(today.getDate() - 1);
  today.month = today.getMonth() + 1;
  today.date = today.getDate() + 1;

  text += '\nShop opening hours:';
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  days.forEach((name, i) => {
    text += '\n   ' + name + ': ';
    if(shop[name] == '0') text += 'closed';
    else{
      const day = JSON.parse(shop[name]);
      text += day.open + '-' + day.close + ', ';
      text += !day.breakStart ? 'non break'
        : 'break ' + day.breakStart + '-' + day.breakEnd;
    }
    text += ';';
  });

  text += '\nHolidays:';
  let qty = 0;
  if(shop.holiday){
    const holidays = JSON.parse(shop.holiday);
    for(let i in holidays){
      const date = i.split('-');
      if(today.month > Number(date[0])) continue;
      if(today.month == Number(date[0]) && today.date > Number(date[1])) continue;

      text += '\n   ' + i + ': ';
      if(!holidays[i]) text += 'closed';
      else{
        text += holidays[i].open + '-' + holidays[i].close + ', ';
        text += !holidays[i].breakStart ? 'non break'
          : 'break ' + holidays[i].breakStart + '-' + holidays[i].breakEnd;
      }
      text += ';';

      ++qty;
      if(qty >= 5) break;
    }
  }

  return text;
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  let t = 'km';
  if(d < 1){
    d = d / 1000; // Distance in m
    t = 'm';
  }
  return { d : d.toFixed(1), t : t };
}

const deg2rad = deg => deg * (Math.PI/180);

module.exports = async (ctx, shops, keyboard) => {

  if(!keyboard) keyboard = [];
  const admin = is_admin(ctx);

  for(let i = 0; i < shops.length; i++){
    let inline_keyboard = [];
    if(admin)
      inline_keyboard.push({
        text : 'EDIT', callback_data : 'shop-edit-' + shops[i].id
      });
    if(admin == 2)
      inline_keyboard.push({
        text : 'REMOVE', callback_data : 'shop-remove-' + shops[i].id
      });

    await ctx.reply(getShop(ctx, shops[i]), {
      reply_markup : {
        resize_keyboard : true,
        inline_keyboard : [ inline_keyboard ]
      },
      parse_mode : 'html'
    });
    await ctx.replyWithLocation(shops[i].latitude, shops[i].longitude, {
      reply_markup : {
        resize_keyboard : true,
        keyboard : [ keyboard ]
      }
    });
  }

};
