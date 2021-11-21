const makePDF = require("../../../services/pdf").default;
const { GraphQLClient, gql } = require("graphql-request");
const { kebabCase } = require("lodash");
const dayjs = require("dayjs");
const isBetween = require('dayjs/plugin/isBetween')
dayjs.extend(isBetween);


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
    allFamilies: familiesByDeleted(deleted: false) {
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
  const { from = dayjs(), to = dayjs() } = req.query;
  const data = await graphQLClient.request(GET_FAMILIES);
  const content = data.allFamilies.data.filter((family) => dayjs(family.createdAt).isBetween(from, to)).map((family) => {
    const { primaryFirstName, primaryLastName } = family;
    return `
    <div
      class="page"
      style="${styleString({
      height: "100%",
      width: "100%",
      position: "relative",
    })}"
    >
      <p>
        Dear ${primaryFirstName} ${primaryLastName},<br /><br />
        Your application for assistance from the Cheer Fund for 2020 has been received and approved.<br /><br />
        <strong>PLEASE NOTE: </strong><br />
        Due to the spread of Covid and the necessary restrictions, the Cheer Fund will NOT be delivering to your home on Christmas Eve.<br />
        Instead you will need to pick your items up at the Decatur County Fairgrounds on Saturday, December 19 from 10 am - 1 pm. <br />
        Please follow the directions below for a contactless delivery of your items.
        <ol>
        <li>
        Enter the Fairgrounds/City Park area using the SR 46 entrance.Follow the signs and the directions of the traffic controllers.
        You will be asked for your name and to see this letter.
        <strong>IF YOU DO NOT HAVE THIS LETTER, YOU WILL NOT BE ABLE TO PICK UP YOUR ITEMS. COPIES WILL NOT BE ACCEPTED.</strong>
        You may designate a friend or family member to pick up your items, but they must have this letter with a note signed by you to pick up.
        </li>
        <li>
          Continue to follow the directions around to the entrance to the livestock barn. You will pull into the livestock barn where the Cheer 
          Fund volunteers will load food items and an envelope with a Visa gift card into your trunk or the back of your SUV or van.
          Please have this space cleared for the volunteer to easily place your items.
        </li>
        <li>
          When directed, continue to pull forward through the barn and out onto the road. Turn right onto Park Road to leave the fairgrounds.
        </li>
        </ol>
        There will be no toys given out this year. The items you will receive will be basic food supplies (milk, eggs, peanut butter, jelly, etc.) and the Visa gift card.
        You may use the Visa card to purchase toys, food and clothing, as needed for your child(ren). <br /><br />
        The Cheer Fund hopes to operate as normal in 2022. This year’s change was made to help keep everyone in Decatur County safe and healthy.<br /><br />
        If you have questions, please address those to DailyNewsCheerFund@gmail.com or call 812.663.3111 ext.217804. <br /><br />
        Please know that the Cheer Fund Committee volunteers wish you and yours a Merry Christmas and a Happy New Year! May 2022 bring blessings upon you!<br /><br />
        The Cheer Fund Committee
      </p>
      <div
        style="${styleString({
      fontSize: "80px",
      fontWeight: "700",
      position: "absolute",
      top: "30%",
      left: "50%",
      "-webkit-transform": "translate(-50%, -50%) rotate(-20deg)",
      boxSizing: "border-box",
      opacity: "0.1",
      color: "#02B8F2",
    })}"
      >
        CHEERFUND
      </div>
    </div>
  `;
  }).join("\n");
  makePDF(content, res);
};

module.exports = handler;