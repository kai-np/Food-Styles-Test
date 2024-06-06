## Food Styles Test

# Comments

Unfortunately I ran short of time during the process as had unexpected work to attend too, and was only able to start the task this morning. However, I have managed to complete the majority of the task, the only areas for improvement is adding filtering / checks when generating the combinations to ensure no unnesscary/redundent data is returned (currently various combinations are returned, which may be usefull in some cases but is something I was unable too improve due to the above mentioned time constraints).

# Setting up the DB

- Enter the root folder, and run "npm install"
- Edit the config.json file with your local/remote Postgres info
- Create the DB, with "node createDB"
- Migrate the DB with "npx sequelize-cli db:migrate"
- Seed DB with: "npx sequelize-cli db:seed:all"
- Test DB tables correct and return rows with: "node testDB"

# Running the script

- Run: "node extractEntities"
