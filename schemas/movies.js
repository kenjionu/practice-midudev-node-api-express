const z = require('zod')
    const movieSchema = z.object({
        title: z.string({
            invalid_type_error: 'Movie title must be a string',
            required_error: 'Movie title is required'
        }),
        year: z.number().int().positive().min(1900).max(2024),
        director: z.string(),
        duration: z.number().int().positive(),
        rate: z.number().min(0).max(10).default(5),
        poster: z.string().url({
            message: 'Poster must be a valid URL'
        }),
        genre: z.array(
            z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
            {
                invalid_type_error: 'Movie title must be a string',
                required_error: 'Movie title is required'
            }
        )
    })

    function validateMovie (object) {
        return movieSchema.safeParse(object)
    }

    function validatePartialMovie (object) {
            //todo cada uno de las proopiedades seran opciones, si esta la valida y si no esta no pasa nada
        return movieSchema.partial().safeParse(object) 
    }
    
    module.exports = {
        validateMovie, validatePartialMovie
    }