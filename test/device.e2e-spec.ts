import { Test, TestingModule } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User, UserRole } from '../src/auth/repository/user.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { clearDatabase, createTestUser, createTestDevice, clearDevices } from '../src/test/test-helpers';
import { globalSetup } from '../src/setup/globals.setup';
import { securitySetup } from '../src/setup/security.setup';

// Temporarily override DB_NAME for test
 // process.env.DB_NAME = 'syncrow_test_e2e';


describe('DeviceController (e2e)', () => {
  let app: NestExpressApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let adminToken: string;
  let testUser: User;
  let testAdmin: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();

    // Apply the same global setup as main.ts
    globalSetup(app);
    securitySetup(app); 

    await app.init();

    // Get services
    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Clear database before tests
    await clearDatabase(dataSource);

    // Create test users
    testUser = await createTestUser(dataSource, 'testuser', 'testpass123');
    testAdmin = await createTestUser(dataSource, 'testadmin', 'adminpass123', UserRole.admin);
    // Generate JWT tokens
    const jwtConfig = configService.get('jwt');
    authToken = await jwtService.signAsync(
      { sub: testUser.id, username: testUser.username },
      { secret: jwtConfig?.secret },
    );
    adminToken = await jwtService.signAsync(
      { sub: testAdmin.id, username: testAdmin.username },
      { secret: jwtConfig?.secret },
    );
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await clearDatabase(dataSource);
      await dataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    await clearDevices(dataSource); // Clear devices before each test
  });

  describe('POST /api/v1/devices', () => {
    it('should create a device', () => {
      return request(app.getHttpServer())
        .post('/api/v1/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Lamp',
          type: 'lamp',
          location: 'Room 101',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Lamp');
          expect(res.body.type).toBe('lamp');
          expect(res.body.location).toBe('Room 101');
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/api/v1/devices')
        .send({
          name: 'Test Device',
          type: 'lamp',
        })
        .expect(401);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'lamp',
        })
        .expect(400);
    });

    it('should validate unique device name', async () => {
      await createTestDevice(dataSource, 'Existing Device', 'lamp');

      return request(app.getHttpServer())
        .post('/api/v1/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Existing Device',
          type: 'lamp',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/devices', () => {
    it('should return paginated devices', async () => {
      await createTestDevice(dataSource, 'Device 12', 'lamp');
      await createTestDevice(dataSource, 'Device 22', 'fan');
      await createTestDevice(dataSource, 'Device 33', 'lamp');

      return request(app.getHttpServer())
        .get('/api/v1/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.total).toBe(3);
        });
    });

    it('should support pagination query parameters', async () => {
      for (let i = 1; i <= 15; i++) {
        await createTestDevice(dataSource, `Device ${i}`, 'lamp');
      }

      return request(app.getHttpServer())
        .get('/api/v1/devices?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(5);
          expect(res.body.total).toBe(15);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/devices')
        .expect(401);
    });
  });

  describe('GET /api/v1/devices/:id', () => {
    it('should return a device by id', async () => {
      const device = await createTestDevice(dataSource, 'Test Device', 'lamp', 'Room 101');

      return request(app.getHttpServer())
        .get(`/api/v1/devices/${device.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(device.id);
          expect(res.body.name).toBe('Test Device');
        });
    });

    it('should return 404 for non-existent device', () => {
      return request(app.getHttpServer())
        .get('/api/v1/devices/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/devices/1')
        .expect(401);
    });
  });

  describe('PUT /api/v1/devices/:id', () => {
    it('should update a device', async () => {
      const device = await createTestDevice(dataSource, 'Original Name', 'lamp', 'Room 101');

      return request(app.getHttpServer())
        .put(`/api/v1/devices/${device.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          type: 'fan',
          location: 'Room 202',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.type).toBe('fan');
          expect(res.body.location).toBe('Room 202');
        });
    });

 

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .put('/api/v1/devices/1')
        .send({
          name: 'Updated',
          type: 'lamp',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/devices/:id', () => {
    it('should delete a device (admin only)', async () => {
      const device = await createTestDevice(dataSource, 'Device to Delete', 'lamp');

      return request(app.getHttpServer())
        .delete(`/api/v1/devices/${device.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 403 for non-admin users', async () => {
      const device = await createTestDevice(dataSource, 'Device to Delete', 'lamp');

      return request(app.getHttpServer())
        .delete(`/api/v1/devices/${device.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent device', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/devices/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/devices/1')
        .expect(401);
    });
  });
});

