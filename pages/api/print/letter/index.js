import makePDF from "../../../../services/pdf";
import { GraphQLClient, gql } from "graphql-request";

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
    allFamilies {
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

const handler = async (req, res) => {
  const data = await graphQLClient.request(GET_FAMILIES);
  const component = (
    <>
      {data.allFamilies.data.map((family) => {
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
        } = family;
        return (
          <main
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
            }}
            key={_id}
            className="page"
          >
            <h1>
              Hello {primaryFirstName} {primaryLastName},
            </h1>
            <div
              style={{
                fontSize: "40px",
                fontWeight: "700",
                position: "absolute",
                top: "50%",
                left: "50%",
                "-webkit-transform": "translate(-50%, -50%) rotate(-20deg)",
                boxSizing: "border-box",
                opacity: "0.5",
                color: "#02B8F2",
              }}
            >
              CHEERFUND
            </div>
          </main>
        );
      })}
    </>
  );
  makePDF(component, res);
};

export default handler;
