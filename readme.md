## Food Styles Test

# Comments

This solution implements all the rules described in the specification. It functions reliably and generates accurate results which could be used to fetch additional data.
It is however worth noting that in production a better approach may be too use NLP (specifically Named Entity Recognition), to identify entity types and keyword matches, while it would be a more advanced undertaking this could allow for broader user inputs and a better overall user experience.

# Setting up the DB

- Enter the root folder, and run "npm install"
- Edit the config.json file with your local/remote Postgres info
- Create the DB, with "node createDB"
- Migrate the DB with "npx sequelize-cli db:migrate"
- Seed DB with: "npx sequelize-cli db:seed:all"
- Test DB tables created correctly and return correct row counts with: "node testDB"

# Running the script

- Run: "node extractEntities"
