import z from 'zod'

const loginValidation = z.object({
    username: z.string().min(3).max(50).email(),
    password: z.string().min(8).max(16) 
});

const request = {
    username : 'bener@gmail.com',
    password : 'aldsfdskfljds'
}

loginValidation.parse(request);