export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  starred?: boolean;
  trashed?: boolean;
  parents?: string[];
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  user?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
}

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  token: string,
  options: {
    query?: string;
    folderId?: string;
    pageSize?: number;
    pageToken?: string;
    orderBy?: string;
  } = {}
): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
  const { query, folderId, pageSize = 30, pageToken, orderBy = 'modifiedTime desc' } = options;

  let q = "trashed = false";
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }
  if (query && query.trim()) {
    const escaped = query.replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }

  const fields = 'nextPageToken, files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, iconLink, thumbnailLink, starred, parents, owners)';
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.append('q', q);
  url.searchParams.append('fields', fields);
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('orderBy', orderBy);
  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Upload a text or binary file to Google Drive
 */
export async function uploadFileToDrive(
  token: string,
  fileName: string,
  content: string | Blob,
  mimeType: string = 'text/plain',
  folderId?: string
): Promise<GoogleDriveFile> {
  const metadata: any = {
    name: fileName,
    mimeType: mimeType,
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const bodyBlobParts: (string | Blob)[] = [];

  bodyBlobParts.push(
    `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`
  );
  bodyBlobParts.push(`${delimiter}Content-Type: ${mimeType}\r\n\r\n`);
  bodyBlobParts.push(content);
  bodyBlobParts.push(closeDelimiter);

  const multipartBody = new Blob(bodyBlobParts);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to upload file: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create a folder in Google Drive
 */
export async function createDriveFolder(
  token: string,
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFile> {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create folder: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete a file or folder from Google Drive
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete file: ${response.statusText}`);
  }
}

/**
 * Get user storage quota & user details
 */
export async function getDriveAboutInfo(token: string): Promise<DriveStorageQuota> {
  const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Drive details: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    limit: data.storageQuota?.limit,
    usage: data.storageQuota?.usage,
    usageInDrive: data.storageQuota?.usageInDrive,
    user: data.user,
  };
}
