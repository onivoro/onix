import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { getContentType } from "./get-content-type.function";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function uploadDirectoryToS3(_: { directoryPath: string, bucketName: string, ACL: any }, s3Client: S3Client) {
    const { directoryPath, bucketName, ACL } = _;
    try {
        const files = await readdir(directoryPath);

        for (const file of files) {
            const filePath = join(directoryPath, file);

            const stats = await stat(filePath);
            if (stats.isFile()) {
                const fileContent = await readFile(filePath);

                const params = {
                    Bucket: bucketName,
                    Key: file,
                    Body: fileContent,
                    ContentType: getContentType(file),
                    ACL
                };

                await s3Client.send(new PutObjectCommand(params));
                console.log(`Successfully uploaded ${file} to ${bucketName}`);
            }
        }

        console.log("All files uploaded successfully!");
    } catch (error) {
        console.error("Error uploading files to S3:", error);
        throw error;
    }
}