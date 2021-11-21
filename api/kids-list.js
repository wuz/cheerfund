const { GraphQLClient, gql } = require("graphql-request");
const { omit } = require("lodash");
const { stringify } = require('csv-stringify/sync');

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
    familiesByDeleted(deleted: false) {
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

const ageToString = {
  "YEAR": "years",
  "MONTH": "months"
};

const genderToString = {
  GIRL: "Girl",
  BOY: "Boy"
}

const handler = async (req, res) => {
  const data = await graphQLClient.request(GET_FAMILIES);
  const headers = ["Key", "First Name", "Last Name", "Gender", "Age", "Notes", "School"].join(",");
  const rows = data.familiesByDeleted.data.map((family) => {
    return family.children.data.map((child) => [
      `${family.primaryFirstName.substr(0, 3)}${family.primaryLastName.substr(0, 3)}${family._id.slice(-2)}`.toLowerCase(),
      child.firstName,
      child.lastName,
      genderToString[child.gender],
      `${child.age} ${ageToString[child.ageType]}`,
      `"${child.notes ?? ""}"`,
      child.school
    ].join(",")).join("\n");
  }).join("\n");
  res.setHeader("Content-Type", "text/csv");
  const csv = [headers, rows].join("\n");
  res.setHeader('Content-disposition', 'attachment; filename=full-list.csv');
  res.end(csv);
};

module.exports = handler;