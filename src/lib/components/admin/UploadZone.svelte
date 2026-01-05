<script lang="ts">
	/**
	 * Upload zone component with progress indicator
	 * Uses XMLHttpRequest for upload progress events
	 */

	interface Props {
		folderName: string;
		onupload?: () => void;
	}

	let { folderName, onupload }: Props = $props();

	let progress = $state(0);
	let isUploading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		uploadFiles(input.files);
	}

	/** Helper: Build FormData for upload */
	function buildUploadFormData(folder: string, files: FileList): FormData {
		const formData = new FormData();
		formData.append('folderName', folder);
		for (const file of files) {
			formData.append('files', file);
		}
		return formData;
	}

	/** Helper: Handle upload completion (success or error) */
	function handleUploadComplete(xhr: XMLHttpRequest): void {
		isUploading = false;
		if (xhr.status >= 200 && xhr.status < 300) {
			try {
				success = JSON.parse(xhr.responseText).message;
			} catch {
				success = 'Upload complete';
			}
			progress = 100;
			if (fileInput) fileInput.value = '';
			onupload?.();
		} else {
			try {
				error = JSON.parse(xhr.responseText).error || 'Upload failed';
			} catch {
				error = 'Upload failed';
			}
		}
	}

	function uploadFiles(files: FileList): void {
		error = null;
		success = null;
		progress = 0;
		isUploading = true;

		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable) progress = Math.round((e.loaded / e.total) * 100);
		});
		xhr.addEventListener('load', () => handleUploadComplete(xhr));
		xhr.addEventListener('error', () => {
			isUploading = false;
			error = 'Network error during upload';
		});

		xhr.open('POST', '/api/upload');
		xhr.send(buildUploadFormData(folderName, files));
	}
</script>

<div class="space-y-3">
	<!-- File Input -->
	<fieldset class="fieldset">
		<legend class="fieldset-legend text-sm">MP3 Files</legend>
		<input
			bind:this={fileInput}
			type="file"
			accept=".mp3,audio/mpeg"
			class="file-input-bordered file-input w-full file-input-sm"
			multiple
			disabled={isUploading}
			onchange={handleFileChange}
		/>
		<label class="label">
			<span class="label-text-alt">Select one or more MP3 files (max 500MB each)</span>
		</label>
	</fieldset>

	<!-- Progress Bar -->
	{#if isUploading}
		<div class="flex items-center gap-3">
			<progress class="progress flex-1 progress-primary" value={progress} max="100"></progress>
			<span class="w-12 text-right font-mono text-sm">{progress}%</span>
		</div>
	{/if}

	<!-- Success Alert -->
	{#if success}
		<div class="alert alert-success">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{success}</span>
		</div>
	{/if}

	<!-- Error Alert -->
	{#if error}
		<div class="alert alert-error">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<span>{error}</span>
		</div>
	{/if}
</div>
