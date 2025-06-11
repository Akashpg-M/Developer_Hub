import axios from 'axios';
import { TEST_CONFIG } from './testConfig';
import { getAuthHeaders } from './authHelper';

describe('Community API Tests', () => {
  let testCommunityId: string;
  let authHeaders: Record<string, string>;

  beforeAll(async () => {
    // Get authentication token before running tests
    authHeaders = await getAuthHeaders();
  });

  // Test 1: Create a new community
  it('should create a new community', async () => {
    const response = await axios.post(
      `${TEST_CONFIG.BASE_URL}/community`,
      TEST_CONFIG.TEST_COMMUNITY,
      { headers: authHeaders }
    );

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(TEST_CONFIG.TEST_COMMUNITY.name);
    
    testCommunityId = response.data.id;
  });

  // Test 2: Get all communities
  it('should get all communities', async () => {
    const response = await axios.get(
      `${TEST_CONFIG.BASE_URL}/community`,
      { headers: authHeaders }
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.communities)).toBe(true);
    expect(response.data).toHaveProperty('total');
  });

  // Test 3: Get single community
  it('should get a single community by ID', async () => {
    const response = await axios.get(
      `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}`,
      { headers: authHeaders }
    );

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(testCommunityId);
  });

  // Test 4: Update community
  it('should update a community', async () => {
    const updatedData = {
      name: 'Updated Community Name',
      description: 'Updated description'
    };

    const response = await axios.put(
      `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}`,
      updatedData,
      { headers: authHeaders }
    );

    expect(response.status).toBe(200);
    expect(response.data.name).toBe(updatedData.name);
    expect(response.data.description).toBe(updatedData.description);
  });

  // Test 5: Get community members
  it('should get community members', async () => {
    const response = await axios.get(
      `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}/members`,
      { headers: authHeaders }
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  // Test 6: Generate invite link
  it('should generate an invite link', async () => {
    const response = await axios.post(
      `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}/invite`,
      {},
      { headers: authHeaders }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('inviteLink');
  });

  // Test 7: Join community (simulate with a different user)
  // This would require a second test user

  // Test 8: Leave community
  it('should allow a user to leave the community', async () => {
    const response = await axios.delete(
      `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}/leave`,
      { headers: authHeaders }
    );

    expect([200, 204]).toContain(response.status);
  });

  // Cleanup: Delete test community
  afterAll(async () => {
    if (testCommunityId) {
      try {
        await axios.delete(
          `${TEST_CONFIG.BASE_URL}/community/${testCommunityId}`,
          { headers: authHeaders }
        );
      } catch (error) {
        console.error('Cleanup failed:', error);
      }
    }
  });
});
