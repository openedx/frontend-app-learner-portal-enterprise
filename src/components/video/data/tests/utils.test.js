import { convertToWebVtt, createWebVttFile } from '../utils';

describe('Video utils tests', () => {
  it('should convert transcript data to WebVTT format correctly', () => {
    const mockTranscriptData = {
      start: [0, 5000],
      end: [5000, 10000],
      text: ['Hello <img src="image.jpg" />World', 'Goodbye'],
    };

    const expectedWebVtt = 'WEBVTT\n\n'
      + '1\n'
      + '00:00:00.000 --> 00:00:05.000\n'
      + 'Hello World\n\n'
      + '2\n'
      + '00:00:05.000 --> 00:00:10.000\n'
      + 'Goodbye\n\n';

    const result = convertToWebVtt(mockTranscriptData);

    expect(result).toBe(expectedWebVtt);
  });
  it('should create a Blob with correct MIME type and generate an Object URL', () => {
    const mockWebVttContent = 'WEBVTT\n\n'
    + '1\n'
    + '00:00:00.000 --> 00:00:05.000\n'
    + 'Hello World\n\n';

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn().mockReturnValue('blob:https://example.com/12345');

    const result = createWebVttFile(mockWebVttContent);

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(result).toBe('blob:https://example.com/12345');

    // Verify Blob properties
    const blob = URL.createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('text/vtt');
    expect(blob.size).toBe(mockWebVttContent.length);
  });
});
