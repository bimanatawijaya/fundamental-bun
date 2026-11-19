import { db } from "./prisma/db.ts"

const select = db.sql.contacts.insert([{
    email: 'bima@gmail.com',
    name : 'Bima',
    phone : '0890803234'
}]).build();

await db.execute(select);