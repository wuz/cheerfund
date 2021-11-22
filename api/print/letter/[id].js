const makePDF = require("../../../services/pdf").default;
const { GraphQLClient, gql } = require("graphql-request");

const makeLetter = require("../../../services/letter").default;

const graphQLClient = new GraphQLClient(
  "https://graphql.us.fauna.com/graphql",
  {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_FAUNA_SECRET}`,
    },
  }
);


const GET_FAMILIES = gql`
  query GetFamilies($id: ID!) {
    family: findFamilyByID(id: $id) {
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
`;

const handler = async (req, res) => {
  const { id } = req.query;
  const data = await graphQLClient.request(GET_FAMILIES, { id });
  const { primaryFirstName, primaryLastName } = data.family;
  const component = makeLetter(primaryFirstName, primaryLastName);
  makePDF(component, res);
};

module.exports = handler;
