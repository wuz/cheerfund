const DownloadLink = ({ data, children, filename = "download" }) => {
  const blob = new Blob([data], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(blob);
  return (
    <a href={fileURL} download={filename}>
      {children}
    </a>
  );
};
export default DownloadLink;
