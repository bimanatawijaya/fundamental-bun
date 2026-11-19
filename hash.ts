// di dalama bun juga ada library untuk hash

const password = "password";

const passwordHash = await Bun.password.hash(password, {
    algorithm : 'bcrypt',
    cost : 10
});

const result = await Bun.password.verify("password", passwordHash, "bcrypt");
console.log(result)