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

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

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
          }
        }
      }
    }
  }
`;

const handler = async (req, res) => {
  const { from, to } = req.query;
  const fromDay = dayjs(from, "MM/DD/YYYY").utc().startOf('day');
  const toDay = dayjs(to, "MM/DD/YYYY").utc().endOf('day');
  const data = await graphQLClient.request(GET_FAMILIES);
  const headers = ["Key", "Primary First", "Primary Last", "Secondary First", "Secondary Last", "Address", "City", "State", "Zip", "Phone 1", "Phone 2", "Children Count", "Created At"].join(",");
  const rows = data.familiesByDeleted.data.filter((family) => dayjs(family.createdAt.slice(0, 10)).utc().isBetween(fromDay, toDay)).map((family) => {
    return [
      `${family.primaryFirstName.substr(0, 3)}${family.primaryLastName.substr(0, 3)}${family._id.slice(-2)}`.toLowerCase(),
      family.primaryFirstName,
      family.primaryLastName,
      family.secondaryFirstName,
      family.secondaryLastName,
      `"${family.address}${family.aptNo ? ` ${family.aptNo}` : ""}"`,
      family.city,
      "IN",
      family.zip,
      family.phone1,
      family.phone2,
      family.children?.data?.length || 0,
      dayjs(family.createdAt.slice(0, 10)).utc().format("MMM DD YYYY")
    ].join(",");
  }).join("\n");
  res.setHeader("Content-Type", "text/csv");
  const csv = [headers, rows].join("\n");
  res.setHeader('Content-disposition', 'attachment; filename=full-list.csv');
  res.end(csv);
};

module.exports = handler;