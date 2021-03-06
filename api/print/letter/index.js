const makePDF = require("../../../services/pdf").default;
const { GraphQLClient, gql } = require("graphql-request");
const dayjs = require("dayjs");
const isBetween = require('dayjs/plugin/isBetween')
const utc = require('dayjs/plugin/utc')

dayjs.extend(isBetween);
dayjs.extend(utc);

const makeLetter = require("../../../services/letter").default;

const graphQLClient = new GraphQLClient(
  "https://graphql.us.fauna.com/graphql",
  {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_FAUNA_SECRET}`,
    },
  }
);

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const GET_FAMILIES = gql`
  query GetFamilies {
    allFamilies: familiesByDeleted(deleted: false, _size: 1000) {
      data {
        _id
        primaryFirstName
        primaryLastName
        secondaryFirstName
        secondaryLastName
        address
        aptNo
        city
        zip
        phone1
        phone2
        deleted
        createdAt
        children {
          data {
            _id
            firstName
            lastName
            gender
            age
            ageType
            notes
            school
          }
        }
      }
    }
  }
`;


const handler = async (req, res) => {
  const { from, to } = req.query;
  const fromDay = dayjs(from, "MM/DD/YYYY").utc().startOf('day');
  const toDay = dayjs(to, "MM/DD/YYYY").utc().add(1, 'day').startOf('day');
  const data = await graphQLClient.request(GET_FAMILIES);
  const content = data.allFamilies.data.filter((family) => dayjs(family.createdAt).utc().isBetween(fromDay, toDay)).map((family) => {
    const { primaryFirstName, primaryLastName } = family;
    return makeLetter(primaryFirstName, primaryLastName);
  }).join("\n");
  makePDF(content, res);
};

module.exports = handler;