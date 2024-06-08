const { Sequelize } = require("sequelize");
const config = require("./config/config.json").development;

class EntityExtractor {
  // Connect to DB using existing DB config file.
  constructor() {
    this.sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        dialect: config.dialect,
      }
    );
  }

  // Main function to execute extraction on given search
  async extractEntities(searchTerm) {
    const terms = this.splitAndFilterTerms(searchTerm);
    if (terms.length === 0) return [];

    const results = await this.fetchResults(terms);
    const cleanTerms = terms.map((term) => term.replace(/%/g, ""));
    const termsWithMultipleEntityTypes =
      this.fetchTermsWithMultipleMatchingEntityTypes(cleanTerms, results);
    const filteredEntityResults = this.filterResultsByType(results);
    const filteredResults = this.removeDuplicates(
      filteredEntityResults,
      termsWithMultipleEntityTypes
    );
    return this.generateCombinations(filteredResults);
  }

  // Prepare search into keyword format for DB search usage
  splitAndFilterTerms(searchTerm) {
    return searchTerm
      .split(" ")
      .map((term) => term.toLowerCase())
      .filter((term) => term.length >= 3)
      .map((term) => `%${term}%`);
  }

  // Fetch entries from DB without loading/locally comparing all entries using ILIKE (SOC)
  async fetchResults(terms) {
    const query = `
      SELECT 'City' as type, id, name FROM "Cities" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Brand' as type, id, name FROM "Brands" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Dish_Type' as type, id, name FROM "Dish_Types" WHERE LOWER(name) ILIKE ANY (array[:terms])
      UNION
      SELECT 'Diet' as type, id, name FROM "Diets" WHERE LOWER(name) ILIKE ANY (array[:terms]);
    `;

    return await this.sequelize.query(query, {
      replacements: { terms },
      type: Sequelize.QueryTypes.SELECT,
    });
  }

  // Find search keywords with mulltiple entity type matches
  fetchTermsWithMultipleMatchingEntityTypes(terms, results) {
    const termsWithMultipleMatchingEntityTypes = [];

    for (const term of terms) {
      const matchingEntitiesForTerm = results.filter((entity) =>
        entity.name.toLowerCase().includes(term)
      );
      if (matchingEntitiesForTerm.length > 1) {
        termsWithMultipleMatchingEntityTypes.push({
          term,
          matches: matchingEntitiesForTerm,
        });
      }
    }

    return termsWithMultipleMatchingEntityTypes;
  }

  // Filter entries by count per type
  filterResultsByType(results) {
    const types = ["City", "Dish_Type", "Brand", "Diet"];
    const filteredResults = {
      typesWithMultipleEntries: [],
      typesWithSingleEntries: [],
    };

    types.forEach((type) => {
      const typeEntries = {
        type,
        entries: results.filter((result) => result.type === type),
      };
      if (typeEntries.entries.length === 1) {
        filteredResults.typesWithSingleEntries.push(typeEntries);
      } else if (typeEntries.entries.length > 1) {
        filteredResults.typesWithMultipleEntries.push(typeEntries);
      }
    });

    return filteredResults;
  }

  // Remove duplicate entries after filtering terms with mulltiple entity types + entity types with mulltiple entries
  removeDuplicates(dataObject, searchArray) {
    const newDataObject = JSON.parse(JSON.stringify(dataObject));

    searchArray.forEach((searchTerm) => {
      searchTerm.matches.forEach((match) => {
        newDataObject.typesWithMultipleEntries.forEach((typeEntry) => {
          typeEntry.entries = typeEntry.entries.filter(
            (entry) => !(entry.type === match.type && entry.id === match.id)
          );
        });

        newDataObject.typesWithSingleEntries.forEach((typeEntry) => {
          typeEntry.entries = typeEntry.entries.filter(
            (entry) => !(entry.type === match.type && entry.id === match.id)
          );
        });
      });
    });

    newDataObject.typesWithMultipleEntries =
      newDataObject.typesWithMultipleEntries.filter(
        (typeEntry) => typeEntry.entries.length > 0
      );
    newDataObject.typesWithSingleEntries =
      newDataObject.typesWithSingleEntries.filter(
        (typeEntry) => typeEntry.entries.length > 0
      );

    return {
      searchTermsWithMultipleEntries: searchArray,
      termsWithMultipleEntries: newDataObject.typesWithMultipleEntries,
      termsWithSingleEntries: newDataObject.typesWithSingleEntries,
    };
  }

  // Generate combinations with filtered data
  generateCombinations(output) {
    const {
      searchTermsWithMultipleEntries,
      termsWithMultipleEntries,
      termsWithSingleEntries,
    } = output;

    const combinations = [];
    const allSingleEntries = termsWithSingleEntries.flatMap(
      (singleEntry) => singleEntry.entries
    );

    if (searchTermsWithMultipleEntries.length === 0) {
      if (termsWithMultipleEntries.length === 0) {
        combinations.push(this.createCombination(null, null, allSingleEntries));
      } else {
        termsWithMultipleEntries.forEach((multipleEntry) => {
          multipleEntry.entries.forEach((multipleEntryItem) => {
            combinations.push(
              this.createCombination(null, multipleEntryItem, allSingleEntries)
            );
          });
        });
      }
    } else {
      searchTermsWithMultipleEntries.forEach((searchTerm) => {
        searchTerm.matches.forEach((match) => {
          if (termsWithMultipleEntries.length === 0) {
            combinations.push(
              this.createCombination(match, null, allSingleEntries)
            );
          } else {
            termsWithMultipleEntries.forEach((multipleEntry) => {
              multipleEntry.entries.forEach((multipleEntryItem) => {
                combinations.push(
                  this.createCombination(
                    match,
                    multipleEntryItem,
                    allSingleEntries
                  )
                );
              });
            });
          }
        });
      });
    }

    return combinations;
  }

  // Create a combination entry making sure rules are maintained
  createCombination(match, multipleEntryItem, singleEntries) {
    const combination = [];
    if (match)
      combination.push({
        type: match.type,
        id: match.id,
        name: match.name.trim(),
      });
    if (multipleEntryItem)
      combination.push({
        type: multipleEntryItem.type,
        id: multipleEntryItem.id,
        name: multipleEntryItem.name.trim(),
      });
    if (singleEntries.length > 0) {
      singleEntries.forEach((singleEntryItem) => {
        combination.push({
          type: singleEntryItem.type,
          id: singleEntryItem.id,
          name: singleEntryItem.name.trim(),
        });
      });
    }
    return combination;
  }
}

// Execute The entity extractor
(async () => {
  const extractor = new EntityExtractor();
  try {
    // Users search query input
    const result = await extractor.extractEntities("sushi in london");
    console.log(result);
  } catch (err) {
    console.error(err);
  } finally {
    extractor.sequelize.close();
  }
})();
