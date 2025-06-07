const CLOUD_NAME = 'dhq8b1o0i';
const UPLOAD_PRESET = 'tabj8mut';

const uniqueUUID = () => {
	return 'xxxxxxxx-xxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

const uploadImage = async (
	file: File | Blob | null | undefined
): Promise<any> => {
	if (!file) {
		throw new Error('Please select a file.');
	}

	const chunkSize = 5 * 1024 * 1024;
	const totalChunks = Math.ceil(file.size / chunkSize);
	let currentChunk = 0;

	const uploadChunk = async (start: number, end: number): Promise<any> => {
		const formData = new FormData();
		formData.append('file', file.slice(start, end));
		formData.append('cloud_name', CLOUD_NAME);
		formData.append('upload_preset', UPLOAD_PRESET);
		// @ts-ignore
		formData.append('public_id', file.name.split('.')[0]);

		const contentRange = `bytes ${start}-${end - 1}/${file.size}`;

		console.log(`Uploading chunk, start: ${start}, end: ${end - 1}`);

		try {
			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
				{
					method: 'POST',
					body: formData,
					headers: {
						'X-Unique-Upload-Id': uniqueUUID(),
						'Content-Range': contentRange,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Chunk upload failed.');
			}

			currentChunk++;

			if (currentChunk < totalChunks) {
				const nextStart = currentChunk * chunkSize;
				const nextEnd = Math.min(nextStart + chunkSize, file.size);
				return await uploadChunk(nextStart, nextEnd);
			} else {
				return await response.json();
			}
		} catch (error) {
			console.error('Error uploading chunk:', error);
			throw error; // Re-throw the error to be caught by the caller
		}
	};

	const start = 0;
	const end = Math.min(chunkSize, file.size);
	return await uploadChunk(start, end);
};

export default uploadImage;
