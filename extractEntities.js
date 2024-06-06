const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config/config.json").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  }
);
async function extractEntities(searchTerm) {
  // Split the search term into words and filter out terms with fewer than 3 characters
  const terms = searchTerm
    .split(" ")
    .map((term) => term.toLowerCase())
    .filter((term) => term.length >= 3)
    .map((term) => `%${term}%`);

  // If no valid terms are found, return an empty array
  if (terms.length === 0) {
    return [];
  }

  // Create the query using ILIKE for partial matching
  const query = `
      SELECT 'City' as type, id, name FROM "Cities" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Brand' as type, id, name FROM "Brands" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Dish_Type' as type, id, name FROM "Dish_Types" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Diet' as type, id, name FROM "Diets" WHERE LOWER(name) ILIKE ANY (array[:terms]);
    `;

  const results = await sequelize.query(query, {
    replacements: { terms },
    type: Sequelize.QueryTypes.SELECT,
  });

  // Initialize an array to store combinations
  const combinations = [];

  // Generate combinations of entities
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      const entityA = results[i];
      const entityB = results[j];
      combinations.push({
        [entityA.type.toLowerCase()]: { id: entityA.id, name: entityA.name },
        [entityB.type.toLowerCase()]: { id: entityB.id, name: entityB.name },
      });
    }
  }

  return combinations;
}

// Run the function
extractEntities("sushi in london")
  .then((result) => {
    console.log(result);
    sequelize.close();
  })
  .catch((err) => {
    console.error(err);
    sequelize.close();
  });
