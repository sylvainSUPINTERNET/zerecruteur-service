# DB

```` bash

 # Create new migration
 
 npx prisma migrate dev --name <migration_db>

 #  Generate client
 
 npm install @prisma/client --save

 npx prisma generate 

 # Run seed script

 npx prisma db seed

````


# setup

```` bash 
# apply migration 

npx prisma migrate dev # usefull after pull

# generate client

npx prisma generate # generate or regenerate client after pull

````