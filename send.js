module.exports = async (ctx, text, reply_markup) => {
  if(!ctx.message){
    if(ctx.update.callback_query.message.text){
      await ctx.answerCbQuery();
      await ctx.editMessageText(text, reply_markup);
    }else{
      await ctx.deleteMessage();
      await ctx.reply(text, reply_markup);
    }
  }else
    await ctx.reply(text, reply_markup);
};
