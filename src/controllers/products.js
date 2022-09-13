module.exports = {
  
  getProducts: async (req, res, next) => {
    const db = await req.app.get('db');
    const results = await db.merch()

    .then(data => res.status(200).send(data))
    .catch(err => console.log(err));
  }
}