import { offlineManager } from '@/lib/offline-manager'

// Mock IndexedDB
const mockDB = {
  transaction: jest.fn(() => ({
    objectStore: jest.fn(() => ({
      get: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
        result: null,
      })),
      put: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      add: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      delete: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      clear: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
      })),
      count: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
        result: 0,
      })),
    })),
  })),
  objectStoreNames: {
    contains: jest.fn().mockReturnValue(true),
  },
}

const mockRequest = {
  result: mockDB,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
}

jest.mock('indexedDB', () => ({
  open: jest.fn(() => mockRequest),
  deleteDatabase: jest.fn(),
}))

describe('OfflineManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize correctly', () => {
    expect(offlineManager).toBeDefined()
  })

  it('should check if app is online', () => {
    const isOnline = offlineManager.isAppOnline()
    expect(typeof isOnline).toBe('boolean')
  })

  it('should get sync status', () => {
    const status = offlineManager.getSyncStatus()
    expect(status).toHaveProperty('pending')
    expect(status).toHaveProperty('inProgress')
    expect(typeof status.pending).toBe('number')
    expect(typeof status.inProgress).toBe('boolean')
  })

  it('should store offline data', async () => {
    const testData = { test: 'data' }
    
    // Mock successful transaction
    mockRequest.onsuccess = () => {
      mockRequest.result = mockDB
    }

    await expect(offlineManager.storeOfflineData('test-key', testData))
      .resolves.not.toThrow()
  })

  it('should get offline data', async () => {
    const testData = { test: 'data' }
    
    // Mock successful get request
    const mockGetRequest = {
      onsuccess: null,
      onerror: null,
      result: { data: testData },
    }

    mockDB.transaction.mockReturnValue({
      objectStore: jest.fn(() => ({
        get: jest.fn(() => mockGetRequest),
      })),
    })

    const result = await offlineManager.getOfflineData('test-key')
    expect(result).toEqual(testData)
  })

  it('should store report offline', async () => {
    const testReport = {
      id: 'test-report',
      title: 'Test Report',
      description: 'Test Description',
      hazard_type: 'tsunami',
      severity: 'high',
      location: { latitude: 12.9716, longitude: 77.5946 },
    }

    // Mock successful transaction
    mockRequest.onsuccess = () => {
      mockRequest.result = mockDB
    }

    await expect(offlineManager.storeReportOffline(testReport))
      .resolves.not.toThrow()
  })

  it('should get offline reports', async () => {
    const testReports = [
      { id: '1', offline: true, title: 'Report 1' },
      { id: '2', offline: false, title: 'Report 2' },
      { id: '3', offline: true, title: 'Report 3' },
    ]

    const mockGetAllRequest = {
      onsuccess: null,
      onerror: null,
      result: testReports,
    }

    mockDB.transaction.mockReturnValue({
      objectStore: jest.fn(() => ({
        getAll: jest.fn(() => mockGetAllRequest),
      })),
    })

    const result = await offlineManager.getOfflineReports()
    expect(result).toHaveLength(2) // Only offline reports
    expect(result.every(report => report.offline)).toBe(true)
  })

  it('should export offline data', async () => {
    const mockReports = [{ id: '1', offline: true }]
    const mockSocialFeeds = [{ id: '1', platform: 'twitter' }]
    const mockUserProfile = { id: 'user1', name: 'Test User' }
    const mockSettings = { theme: 'dark' }

    // Mock getOfflineReports
    jest.spyOn(offlineManager, 'getOfflineReports').mockResolvedValue(mockReports)
    jest.spyOn(offlineManager, 'getOfflineData')
      .mockResolvedValueOnce(mockSocialFeeds)
      .mockResolvedValueOnce(mockUserProfile)
      .mockResolvedValueOnce(mockSettings)

    const result = await offlineManager.exportOfflineData()

    expect(result).toEqual({
      reports: mockReports,
      socialMediaFeeds: mockSocialFeeds,
      userProfile: mockUserProfile,
      settings: mockSettings,
      lastSync: expect.any(String),
    })
  })

  it('should clear offline data', async () => {
    // Mock successful clear operations
    mockRequest.onsuccess = () => {
      mockRequest.result = mockDB
    }

    await expect(offlineManager.clearOfflineData())
      .resolves.not.toThrow()
  })
})
