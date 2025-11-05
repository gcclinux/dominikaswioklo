import { ObjectId } from 'mongodb';
import { getDb } from './mongoInit';

// Minimal MongoDB-backed queries that mirror the sqlite DatabaseQueries surface.
// Note: IDs are returned as strings (ObjectId) for inserted documents.

export class DatabaseQueries {
  static async createAppointment(appointment: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('appointments').insertOne(appointment);
    return String(res.insertedId);
  }

  static async getAppointments(): Promise<any[]> {
    const db = getDb();
    const pipeline = [
      { $sort: { date: 1, timeStart: 1 } },
      {
        $lookup: {
          from: 'users',
          let: { apptUserId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uid', '$$apptUserId'] },
                    { $eq: ['$_id', { $convert: { input: '$$apptUserId', to: 'objectId', onError: null, onNull: null } }] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          name: '$user.name',
          surname: '$user.surname',
          email: '$user.email',
          phone: '$user.phone',
          ipAddress: '$user.ipAddress'
        }
      },
      { $project: { user: 0 } }
    ];
    return db.collection('appointments').aggregate(pipeline).toArray();
  }

  static async getAppointmentsByDate(date: string): Promise<any[]> {
    const db = getDb();
    const pipeline = [
      { $match: { date, cancelled: { $ne: 1 } } },
      { $sort: { timeStart: 1 } },
      {
        $lookup: {
          from: 'users',
          let: { apptUserId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uid', '$$apptUserId'] },
                    { $eq: ['$_id', { $convert: { input: '$$apptUserId', to: 'objectId', onError: null, onNull: null } }] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $addFields: { name: '$user.name', surname: '$user.surname', email: '$user.email', phone: '$user.phone', ipAddress: '$user.ipAddress' } },
      { $project: { user: 0 } }
    ];
    return db.collection('appointments').aggregate(pipeline).toArray();
  }

  static async getAppointmentByUdi(udi: string): Promise<any | null> {
    const db = getDb();
    const pipeline = [
      { $match: { udi } },
      {
        $lookup: {
          from: 'users',
          let: { apptUserId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$uid', '$$apptUserId'] },
                    { $eq: ['$_id', { $convert: { input: '$$apptUserId', to: 'objectId', onError: null, onNull: null } }] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $addFields: { name: '$user.name', surname: '$user.surname', email: '$user.email', phone: '$user.phone', ipAddress: '$user.ipAddress' } },
      { $project: { user: 0 } },
      { $limit: 1 }
    ];
    const docs = await db.collection('appointments').aggregate(pipeline).toArray();
    return docs[0] || null;
  }

  static async updateAppointment(id: any, updates: any): Promise<void> {
    const db = getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await db.collection('appointments').updateOne({ _id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  }

  static async blockAllAppointmentsForUser(userId: any): Promise<number> {
    const db = getDb();
    const res = await db.collection('appointments').updateMany({ userId }, { $set: { cancelled: 1, status: 'blocked', updatedAt: new Date().toISOString() } });
    return res.modifiedCount;
  }

  static async blockAllAppointmentsByEmail(email: string): Promise<number> {
    const db = getDb();
    // find user ids with email
    const users = await db.collection('users').find({ email }).project({ uid: 1 }).toArray();
    const uids = users.map(u => u.uid).filter(Boolean);
    const res = await db.collection('appointments').updateMany({ userId: { $in: uids } , cancelled: { $ne: 1 } }, { $set: { cancelled: 1, status: 'blocked', updatedAt: new Date().toISOString() } });
    return res.modifiedCount;
  }

  static async countUserAppointmentsByDateRange(userId: any, startDate: string, endDate: string): Promise<number> {
    const db = getDb();
    const count = await db.collection('appointments').countDocuments({ userId, cancelled: { $ne: 1 }, date: { $gte: startDate, $lte: endDate } });
    return count;
  }

  // USERS
  static async createUser(user: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('users').insertOne({ ...user, createdAt: new Date().toISOString() });
    return String(res.insertedId);
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    const db = getDb();
    return db.collection('users').findOne({ email });
  }

  static async getUsers(): Promise<any[]> {
    const db = getDb();
    return db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
  }

  static async getUserById(uid: any): Promise<any | null> {
    const db = getDb();
    const _id = typeof uid === 'string' ? new ObjectId(uid) : uid;
    return db.collection('users').findOne({ _id });
  }

  // SETTINGS
  static async getSettings(): Promise<any> {
    const db = getDb();
    return db.collection('settings').findOne({ sid: 1 });
  }

  static async updateSettings(settings: any): Promise<void> {
    const db = getDb();
    await db.collection('settings').updateOne({ sid: 1 }, { $set: { ...settings, updatedAt: new Date().toISOString() } }, { upsert: true });
  }

  // BLOCKED
  static async addBlocked(blocked: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('blocked').insertOne({ ...blocked, createdAt: new Date().toISOString() });
    return String(res.insertedId);
  }

  static async isBlocked(ipAddress: string, userId?: any): Promise<boolean> {
    const db = getDb();
    const q: any = { ipAddress };
    if (userId) q.userId = userId;
    const count = await db.collection('blocked').countDocuments(q);
    return count > 0;
  }

  static async getBlocked(): Promise<any[]> {
    const db = getDb();
    return db.collection('blocked').find({}).sort({ createdAt: -1 }).toArray();
  }

  static async deleteBlocked(bid: any): Promise<void> {
    const db = getDb();
    const _id = typeof bid === 'string' ? new ObjectId(bid) : bid;
    await db.collection('blocked').deleteOne({ _id });
  }

  // ADMINS
  static async createAdmin(admin: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('admin').insertOne({ ...admin, createdAt: new Date().toISOString(), passwordLastChanged: new Date().toISOString() });
    return String(res.insertedId);
  }

  static async getAdmins(): Promise<any[]> {
    const db = getDb();
    return db.collection('admin').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
  }

  static async getAdminById(aid: any): Promise<any | null> {
    const db = getDb();
    const _id = typeof aid === 'string' ? new ObjectId(aid) : aid;
    return db.collection('admin').findOne({ _id }, { projection: { password: 0 } });
  }

  static async getAdminByLogin(login: string): Promise<any | null> {
    const db = getDb();
    return db.collection('admin').findOne({ login });
  }

  static async updateAdmin(aid: any, updates: any): Promise<void> {
    const db = getDb();
    const _id = typeof aid === 'string' ? new ObjectId(aid) : aid;
    await db.collection('admin').updateOne({ _id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  }

  static async deleteAdmin(aid: any): Promise<void> {
    const db = getDb();
    const _id = typeof aid === 'string' ? new ObjectId(aid) : aid;
    await db.collection('admin').deleteOne({ _id });
  }

  static async updateUser(uid: any, updates: any): Promise<void> {
    const db = getDb();
    const _id = typeof uid === 'string' ? new ObjectId(uid) : uid;
    await db.collection('users').updateOne({ _id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  }

  static async deleteUser(uid: any): Promise<void> {
    const db = getDb();
    const _id = typeof uid === 'string' ? new ObjectId(uid) : uid;
    await db.collection('users').deleteOne({ _id });
  }

  // EMAIL SETTINGS
  static async getEmailSettings(): Promise<any> {
    const db = getDb();
    return db.collection('email_settings').findOne({ eid: 1 });
  }

  static async updateEmailSettings(settings: any): Promise<void> {
    const db = getDb();
    await db.collection('email_settings').updateOne({ eid: 1 }, { $set: { ...settings, updatedAt: new Date().toISOString() } }, { upsert: true });
  }

  // APPOINTMENT TYPES
  static async getAppointmentTypes(): Promise<any[]> {
    const db = getDb();
    return db.collection('appointment_types').find({}).sort({ appName: 1 }).toArray();
  }

  static async updateAppointmentTypes(types: any[], currency: string): Promise<void> {
    const db = getDb();
    await db.collection('appointment_types').deleteMany({});
    if (!types || types.length === 0) return;
    const docs = types.map(t => ({ appName: t.name, appTag: t.tag || t.name, appPrice: t.price || null, appCurrency: currency || 'USD' }));
    await db.collection('appointment_types').insertMany(docs);
  }

  // LICENSES
  static async createLicense(entry: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('licenses').insertOne({ saleId: entry.saleId || null, name: entry.name, email: entry.email, licenseKey: entry.licenseKey, status: entry.status || 'active', createdAt: new Date().toISOString() });
    return String(res.insertedId);
  }

  static async getLicenseBySaleId(saleId: string): Promise<any | null> {
    const db = getDb();
    return db.collection('licenses').findOne({ saleId });
  }

  static async getLicenseByEmail(email: string): Promise<any | null> {
    const db = getDb();
    return db.collection('licenses').findOne({ email }, { sort: { createdAt: -1 } });
  }

  // NEWSLETTERS
  static async createNewsletter(newsletter: any): Promise<string> {
    const db = getDb();
    const res = await db.collection('newsletters').insertOne({ ...newsletter, created_at: new Date().toISOString() });
    return String(res.insertedId);
  }

  static async getNewsletters(): Promise<any[]> {
    const db = getDb();
    return db.collection('newsletters').find({}).sort({ created_at: -1 }).toArray();
  }

  static async getNewsletterById(id: any): Promise<any | null> {
    const db = getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    return db.collection('newsletters').findOne({ _id });
  }

  static async updateNewsletter(id: any, updates: any): Promise<void> {
    const db = getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await db.collection('newsletters').updateOne({ _id }, { $set: updates });
  }

  static async deleteNewsletter(id: any): Promise<void> {
    const db = getDb();
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    await db.collection('newsletters').deleteOne({ _id });
  }
}

export default DatabaseQueries;
