import { useQuery, gql } from "@apollo/client";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  Form,
  PageHeader,
  Input,
  Button,
  Checkbox,
  Typography,
  Row,
  Col,
  Divider,
  Select,
  Space,
  Card,
  Skeleton,
  Descriptions,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

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

export default function FamilyShow() {
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
        <title>Family - CheerFund</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageHeader
        title={`${primaryFirstName} ${primaryLastName}`}
        subTitle={`and ${secondaryFirstName} ${secondaryLastName}`}
        backIcon={false}
      />
      <Space direction="vertical">
        <Card key={_id}>
          <Descriptions title="Family Details">
            <Descriptions.Item label="Phone #1">{phone1}</Descriptions.Item>
            <Descriptions.Item label="Phone #2">{phone2}</Descriptions.Item>
            <Descriptions.Item label="Address">
              {address}, {aptNo} {city}, {zip}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        {children.data.map((child) => {
          return (
            <Card key={child._id}>
              <Title level={4}>
                {child.firstName} {child.lastName}
              </Title>
              <Descriptions title="Child Details">
                <Descriptions.Item label="Age">
                  {child.age} {AgeType[child.ageType]}
                </Descriptions.Item>
                <Descriptions.Item label="School">
                  {child.school}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {Gender[child.gender]}
                </Descriptions.Item>
                <Descriptions.Item label="Notes">
                  {child.notes}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}