<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

#Teslo API

1. Execute the following command:

```
yarn install
```

2. Rename the **.env.template** to **.env**
3. Up the database

```
docker-compose up -d
```

4. Run the project dev mood:

```
yarn start:dev
```

5. Fill the database you must call the following POST request:

```
http://localhost:3000/api/seed
```
