import express, { response } from 'express';

const app = express();



// http://localhost:3333/users
app.get("/", (request, response) => {
    return response.json({ message: "Hello World!" });
});

app.post("/", (request, response) => {
    return response.json({ message: "Dados foram salvo com successo." })
});

app.listen(3333, () => console.log("Server is running!"));