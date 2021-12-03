const makePDF = require("../../../services/pdf").default;
const { GraphQLClient, gql } = require("graphql-request");
const { kebabCase } = require("lodash");
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


const styleString = (obj) => Object.entries(obj).map(([key, value]) => `${key[0] === "-" ? key : kebabCase(key)}: ${value};`).join("");

const handler = async (req, res) => {
  const { from, to } = req.query;
  const fromDay = dayjs(from, "MM/DD/YYYY").utc().startOf('day');
  const toDay = dayjs(to, "MM/DD/YYYY").utc().add(1, 'day').startOf('day');
  const data = await graphQLClient.request(GET_FAMILIES);
  const content = data.allFamilies.data.filter((family) => dayjs(family.createdAt).utc().isBetween(fromDay, toDay)).map((family) => {
    const {
      _id,
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
      otherAdults
    } = family;
    console.log(toDay, fromDay, dayjs(family.createdAt.slice(0, 10)));
    return `
    <main
      class="page"
      style="height: 100%;width:100%;position:relative;">
      <h3>Key: ${`${primaryFirstName.substr(0, 3)}${primaryLastName.substr(0, 3)}${_id.slice(-2)}`.toLowerCase()}</h3>
      <h1>
        ${primaryFirstName} ${primaryLastName}
      </h1>
      ${secondaryFirstName || secondaryFirstName ? (`<h2>
        ${secondaryFirstName} ${secondaryLastName}
      </h2>`) : ""}
      <address>
        ${address} ${aptLotNo ? ", aptLotNo" : ""}
        <br />
        ${city}, IN ${zip}
      </address>
      <p>Phone #1: ${phone1}</p>
      ${phone2 ? `<p>Phone #2: ${phone2}</p>` : ""}
      <h3>Food for: __________</h3>
      <h2>Other Adults</h2>
      <ul>
        ${otherAdults?.length > 0 ? otherAdults.data.map((adult) => {
      return `
            <li>
              <strong>
                ${adult.firstName} ${adult.lastName}
              </strong>
            </li>
          `;
    }).join("\n") : ""}
      </ul>
      <h2>Children</h2>
      <ul>
        ${children.data.map((child) => {
      return `
            <li>
              <strong>
                ${child.firstName} ${child.lastName}
              </strong>
              <br />
              ${toTitleCase(child.gender)} | ${child.school} | ${child.age} ${toTitleCase(child.ageType)}s<br /><br />
              ${child.notes ?? ""}
            </li>
          `;
    }).join("\n")}
      </ul>
    </main>
  `;
  }).join("\n");
  makePDF(content, res);
};

module.exports = handler;
