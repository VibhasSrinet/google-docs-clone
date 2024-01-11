const mongoose = require("mongoose")
const Document = require("./Document")

const username = encodeURIComponent("vibhassinghvs");
const password = encodeURIComponent("MyD@7@8@53");

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.wdcqnpi.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
}).then(()=>{
  console.log("Coonection Successfull!");
}).catch(err=>{
  console.log(err)
});

const db = mongoose.connection;

// Event listener for successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB');
  
  // You can perform additional actions here if needed
});

// Event listener for connection error
db.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});


const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
