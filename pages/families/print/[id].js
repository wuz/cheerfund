import { useQuery, useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  PageHeader,
  Button,
  Typography,
  Modal,
  Space,
  Card,
  Skeleton,
  Descriptions,
} from "antd";
import { componentToPDFBuffer } from "../../../services/pdf";
const DownloadLink = dynamic(() => import("../../../components/DownloadLink"));

const { Title } = Typography;

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

const Gender = {
  BOY: "Boy",
  GIRL: "Girl",
};

const AgeType = {
  YEAR: "years",
  MONTH: "months",
};

export default function PrintFamily({ pdf }) {
  const router = useRouter();
  const { id } = router.query;
  const { loading, error, data } = useQuery(GET_FAMILIES, {
    variables: { id },
  });
  if (loading || !data) return <Skeleton active loading={loading} />;
  const {
    _id,
    primaryFirstName,
    primaryLastName,
    secondaryFirstName,
    secondaryLastName,
    address,
    aptNo,
    city,
    zip,
    phone1,
    phone2,
    children,
  } = data?.family;
  return (
    <div>
      <Head>
        <title>Print Family - CheerFund</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageHeader
        title="Printing"
        subTitle={`${primaryFirstName} ${primaryLastName} and ${secondaryFirstName} ${secondaryLastName}`}
        backIcon={false}
      />
      <Space direction="vertical">
        <Card key={_id}>
          <DownloadLink data={pdf}>Download PDF</DownloadLink>
        </Card>
      </Space>
    </div>
  );
}

export const getServerSideProps = async ({ query }) => {
  const exportPDF = query.exportPDF === "true";

  if (exportPDF) {
    const buffer = await componentToPDFBuffer(
      <div>
        <h1>A Test</h1>
      </div>
    );

    return { props: { pdf: buffer.toString() } };
  }

  return { props: {} };
};
