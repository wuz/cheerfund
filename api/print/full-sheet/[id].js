const makePDF = require("../../../services/pdf");
const { GraphQLClient, gql } = require("graphql-request");

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
  const {
    primaryFirstName,
    primaryLastName,
    secondaryFirstName,
    secondaryLastName,
    address,
    aptLotNo,
    city,
    zip,
    phone1,
    phone2,
    children,
  } = data.family;
  const component = `
    <main
      style="height: 100%;width:100%;position:relative;">
      <h1>
        ${primaryFirstName} ${primaryLastName}
      </h1>
      <h2>
        ${secondaryFirstName} ${secondaryLastName}
      </h2>
      <address>
        ${address} ${aptLotNo ? ", aptLotNo" : ""}
        <br />
        ${city}, IN ${zip}
      </address>
      <p>Phone #1: ${phone1}</p>
      ${phone2 ? `<p>Phone #2: ${phone2}</p>` : ""}
      <h2>Children</h2>
      <ul>
        ${children.data.map((child) => {
          return `
            <li>
              <strong>
                ${child.firstName} ${child.lastName}
              </strong>
              <br />
              ${toTitleCase(child.gender)} | ${child.school}
            </li>
          `;
        }).join("\n")}
      </ul>
    </main>
  `;
  makePDF(component, res);
};

module.exports = handler;
