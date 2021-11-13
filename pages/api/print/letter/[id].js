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
  const component = (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
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
    </div>
  );
  makePDF(component, res);
};

export default handler;
