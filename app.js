const express = require('express')
const crypto = require('node:crypto') //Esto funcionaba en el navegador también
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
// las APIS siempre deben ser un embudo, las apis deben ser robustasm no pueden ser exquisitas a lo que pasas

const app = express()
app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express
app.use(express.json())

// metodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

const ACCEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://movies:com',
    'https://midu.dev'
]

app.get('/', (req, res) => {
    res.json({ message: 'Hola Mundo'})
})

// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
    // cuando la petición es del mismo Origin
    // http://localhost:1234 -> http://localhost:1234
    // No te mandara la cabeza de origin
    const origin = req.header('origin')
    if( ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    const { genre } = req.query
    if(genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
    }
    res.json(movies)
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (!result.success) {
        // 422 Unproccessable Entity
        // 400 Bad Request
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }
  
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    // esto no seria Reest, estamos guardando estado de la app en memoria
    // el estado de la aplicacion en memoria
    movies.push(newMovie)



    //http status 201 para crear un recurso
    res.status(201).json(newMovie) // actualizar la caché del cliente
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted'})
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if(!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message )})
    }
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.get('/movies/:id', (req, res) => { //path-to-regexp (Puedes poner rutas que son regex)
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)

    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found'})
})

app.options('/movies', (req, res) => {
    const origin = req.header('origin')
    if( ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    }
    res.send(200)
})


const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`)
})