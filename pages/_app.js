import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import "../styles/globals.css";
import "antd/dist/antd.css";
import { useRouter } from "next/router";
import Link from "next/link";
import { Col, Layout, Menu, Row, Space } from "antd";
import { StarFilled } from "@ant-design/icons";

const { Content, Sider } = Layout;

const authLink = setContext((_, { headers }) => {
  const token = process.env.NEXT_PUBLIC_FAUNA_SECRET;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = createHttpLink({
  uri: "https://graphql.us.fauna.com/graphql",
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const pages = {
  ["/families/new"]: "New Family",
  ["/families/list"]: "List Families",
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const currentPath = router.pathname;
  return (
    <ApolloProvider client={client}>
      <Layout>
        <Sider
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
          }}
        >
          <Row
            align="middle"
            justify="center"
            gutter={8}
            style={{ color: "#ffffff", padding: "16px 24px" }}
          >
            <Col>
              <StarFilled />
            </Col>
            <Col>CheerFund</Col>
          </Row>
          <Menu theme="dark" mode="inline" selectedKeys={[currentPath]}>
            {Object.entries(pages).map(([path, name]) => (
              <Menu.Item key={path}>
                <Link href={path}>
                  <a>{name}</a>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200, minHeight: "100vh" }}>
          <Content
            style={{
              margin: "24px 16px 0",
              overflow: "initial",
              maxWidth: "960px",
            }}
          >
            <Component {...pageProps} />
          </Content>
        </Layout>
      </Layout>
    </ApolloProvider>
  );
}

export default MyApp;
