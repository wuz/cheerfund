import { useRouter } from "next/router";
import { useMutation, gql } from "@apollo/client";
import Head from "next/head";
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
  Affix,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import cities from "../../services/cities";

const { Title, Text } = Typography;

const CREATE_FAMILY = gql`
  mutation CreateFamily($data: FamilyInput!) {
    createFamily(data: $data) {
      _id
    }
  }
`;

export default function NewFamily() {
  const router = useRouter();
  const onCompleted = (data) => {
    router.push(`/families/${data.createFamily._id}`);
  };
  const [createFamily] = useMutation(CREATE_FAMILY, {
    onCompleted,
  });
  const [form] = Form.useForm();
  const onFinish = (values) => {
    const { children } = values;
    createFamily({
      variables: {
        data: {
          ...values,
          zip: cities.find((c) => c.city === values.city).zip.toString(),
          createdAt: new Date(),
          deleted: false,
          children: {
            create: children.map((child) => ({
              ...child,
              age: Number(child.age),
              createdAt: new Date(),
            })),
          },
        },
      },
    });
  };
  return (
    <div>
      <Head>
        <title>New Family - CheerFund</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PageHeader
        title="New Family"
        subTitle="Create a new family"
        backIcon={false}
      />
      <Form layout="vertical" onFinish={onFinish}>
        <Title level={3}>Primary Adult</Title>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="First Name" name="primaryFirstName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Last Name" name="primaryLastName">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Title level={3}>Secondary Adult</Title>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="First Name" name="secondaryFirstName">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Last Name" name="secondaryLastName">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Apt/Lot No." name="aptNo">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="City" name="city">
              <Select showSearch>
                {cities.map(({ city }) => (
                  <Select.Option value={city}>{city}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Zip"
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.city !== currentValues.city
              }
            >
              {({ getFieldValue }) => {
                const city = getFieldValue("city");
                if (!city) return <Text secondary>Select a city</Text>;
                return cities.find((c) => c.city === city).zip;
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone #1" name="phone1">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone #2" name="phone2">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Form.List name="children">
          {(fields, { add, remove }, { errors }) => (
            <Row>
              <Space direction="vertical">
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Card
                    key={key}
                    actions={[
                      <Button onClick={() => remove(name)} key="remove">
                        Remove Child
                      </Button>,
                    ]}
                  >
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="First Name"
                          name={[name, "firstName"]}
                          fieldKey={[fieldKey, "firstName"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="Last Name"
                          name={[name, "lastName"]}
                          fieldKey={[fieldKey, "lastName"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          label="Gender"
                          name={[name, "gender"]}
                          fieldKey={[fieldKey, "gender"]}
                        >
                          <Select showSearch>
                            <Select.Option value="BOY">Boy</Select.Option>
                            <Select.Option value="GIRL">Girl</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          label="School"
                          name={[name, "school"]}
                          fieldKey={[fieldKey, "school"]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          label="Age"
                          name={[name, "age"]}
                          fieldKey={[fieldKey, "age"]}
                        >
                          <Input type="number" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          label="Years/Months"
                          name={[name, "ageType"]}
                          fieldKey={[fieldKey, "ageType"]}
                        >
                          <Select defaultValue="years" showSearch>
                            <Select.Option value="YEAR">Years</Select.Option>
                            <Select.Option value="MONTH">Months</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          label="Notes"
                          name={[name, "notes"]}
                          fieldKey={[fieldKey, "notes"]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
              <Form.Item style={{ marginTop: "16px" }}>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Child
                </Button>
              </Form.Item>
              <Divider />
            </Row>
          )}
        </Form.List>
        <Affix offsetBottom={10}>
          <Card>
            <Row align="center">
              <Button size="large" htmlType="submit" type="primary">
                Save Family
              </Button>
            </Row>
          </Card>
        </Affix>
      </Form>
    </div>
  );
}
