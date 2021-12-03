const { GraphQLClient, gql } = require("graphql-request");
const dayjs = require("dayjs");
const isBetween = require('dayjs/plugin/isBetween')
const utc = require('dayjs/plugin/utc')

dayjs.extend(isBetween);
dayjs.extend(utc);

const graphQLClient = new GraphQLClient(
  "https://graphql.us.fauna.com/graphql",
  {
    headers: {
      authorization: `Bearer ${process.env.NEXT_PUBLIC_FAUNA_SECRET}`,
    },
  }
);

const GET_FAMILIES = gql`
  query GetFamilies {
    familiesByDeleted(deleted: false, _size: 1000) {
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
            createdAt
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
  const { from, to } = req.query;
  const fromDay = dayjs(from, "MM/DD/YYYY").utc().startOf('day');
  const toDay = dayjs(to, "MM/DD/YYYY").utc().add(1, 'day').startOf('day');
  const data = await graphQLClient.request(GET_FAMILIES);
  const headers = ["Key", "First Name", "Last Name", "Gender", "Age", "Notes", "School", "Family Created At", "Child Created At"].join(",");
  const rows = data.familiesByDeleted.data.filter((family) => dayjs(family.createdAt).utc().isBetween(fromDay, toDay)).map((family) => {
    return family.children.data.map((child) => [
      `${family.primaryFirstName.substr(0, 3)}${family.primaryLastName.substr(0, 3)}${family._id.slice(-2)}`.toLowerCase(),
      child.firstName,
      child.lastName,
      genderToString[child.gender],
      `${child.age} ${ageToString[child.ageType]}`,
      `"${child.notes ?? ""}"`,
      child.school,
      dayjs(family.createdAt.slice(0, 10)).format("MMM DD YYYY"),
      dayjs(child.createdAt.slice(0, 10)).format("MMM DD YYYY")
    ].join(",")).join("\n");
  }).join("\n");
  res.setHeader("Content-Type", "text/csv");
  const csv = [headers, rows].join("\n");
  res.setHeader('Content-disposition', 'attachment; filename=full-list.csv');
  res.end(csv);
};

module.exports = handler;