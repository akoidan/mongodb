require('dotenv').config();
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { MongoClient, ObjectId } = require('mongodb');

const app = new Koa();
const router = new Router();
let db;

MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    db = client.db('messaging-app');
    console.log('Connected to MongoDB');
  });

app.use(bodyParser());

// Routes
router.get('/', (ctx) => ctx.body = { message: 'API running' });

router.get('/users', async (ctx) => {
  ctx.body = await db.collection('users').find({}).toArray();
});

router.get('/users-with-messages', async (ctx) => {
  const result = await db.collection('users').aggregate([
    {
      $lookup: {
        from: 'messages',
        localField: '_id',
        foreignField: 'userId',
        as: 'messages'
      }
    }
  ]).toArray();
  ctx.body = result;
});

router.post('/users', async (ctx) => {
  const result = await db.collection('users').insertOne({ ...ctx.request.body, createdAt: new Date() });
  ctx.body = { ...ctx.request.body, _id: result.insertedId };
});

router.get('/users/:id/messages', async (ctx) => {
  ctx.body = await db.collection('messages').find({ userId: new ObjectId(ctx.params.id) }).toArray();
});

router.post('/messages', async (ctx) => {
  const result = await db.collection('messages').insertOne({ 
    ...ctx.request.body, 
    userId: new ObjectId(ctx.request.body.userId), 
    createdAt: new Date() 
  });
  ctx.body = { ...ctx.request.body, _id: result.insertedId };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => console.log('Server on port 3000'));
