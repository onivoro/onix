import { readdir, readFile, stat } from "fs/promises";
import { join, resolve } from "path";
import { getContentType } from "./get-content-type.function";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function uploadDirectoryToS3(_: { directoryPath: string, directoryPathToRemoveFromS3Path: string, bucketName: string, ACL: any, prefix?: string }, s3Client: S3Client) {
    const { directoryPath, directoryPathToRemoveFromS3Path, bucketName, ACL, prefix = '' } = _;
    try {
        const files = await readdir(directoryPath);

        for (const file of files) {
            const filePath = join(directoryPath, file);

            const stats = await stat(filePath);
            if (stats.isFile()) {
                const fileContent = await readFile(filePath);
                const toReplace = `${directoryPathToRemoveFromS3Path}/`.replace('//', '/')
                const Key = `${prefix}${file}`.replace(toReplace, '');
                const params = {
                    Bucket: bucketName,
                    Key,
                    Body: fileContent,
                    ContentType: getContentType(file),
                    ACL
                };

                await s3Client.send(new PutObjectCommand(params));
                console.log(`Successfully uploaded ${file} to ${bucketName} ${Key}`);
            } else if (stats.isDirectory()) {
                await uploadDirectoryToS3({ directoryPathToRemoveFromS3Path, directoryPath: resolve(directoryPath, filePath), bucketName, ACL, prefix: `${filePath}/` }, s3Client);
            }
        }

        console.log("All files uploaded successfully!");
    } catch (error) {
        console.error("Error uploading files to S3:", error);
        throw error;
    }
}