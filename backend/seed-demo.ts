import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ORION_ID = "18e82a7e-ff6a-41be-b06c-23f6eaf27abe";
const FIXED_USER_ID = "b6a2ab5b-bb32-4f48-9633-41404a271ef1";
const DUMMY_HASH = "$2b$10$EpjVIByH.t1p59.9c.vS9.N.J6F/p7p.9p.9p.9p.9p.9p.9p.9p."; // Mock hash

async function main() {
    console.log('--- INITIALIZING NEXUS DEMO SEED (COLLABORATION FOCUS) ---');

    // 1. ENSURE DEMO USERS EXIST (Since DB was reset)
    await (prisma.user as any).upsert({
        where: { id: ORION_ID },
        update: { role: 'admin' },
        create: {
            id: ORION_ID,
            email: 'orion@nexus.dev',
            name: 'ORION',
            passwordHash: DUMMY_HASH,
            role: 'admin',
            level: 5,
            xp: 1250
        }
    });

    await (prisma.user as any).upsert({
        where: { id: FIXED_USER_ID },
        update: {},
        create: {
            id: FIXED_USER_ID,
            email: 'operator_alpha@nexus.dev',
            name: 'Operator Alpha',
            passwordHash: DUMMY_HASH,
            role: 'operator'
        }
    });

    // 2. CREATE TEAM (SQUAD)
    const team = await prisma.team.upsert({
        where: { code: 'CS-VANGUARD-99' },
        update: {},
        create: {
            name: 'CS Vanguard Alpha',
            code: 'CS-VANGUARD-99',
        }
    });

    // 3. ESTABLISH AUTHORITY (ROLES)
    await prisma.teamMember.upsert({
        where: { userId_teamId: { userId: ORION_ID, teamId: team.id } },
        update: { role: 'commander' },
        create: { userId: ORION_ID, teamId: team.id, role: 'commander' }
    });

    await prisma.teamMember.upsert({
        where: { userId_teamId: { userId: FIXED_USER_ID, teamId: team.id } },
        update: { role: 'operator' },
        create: { userId: FIXED_USER_ID, teamId: team.id, role: 'operator' }
    });

    // 4. GENERATE TACTICAL TASKS
    const task1 = await prisma.task.create({
        data: {
            title: 'Neural Network Optimization',
            description: 'Optimize the weight initialization for the transformer model.',
            status: 'in-progress',
            priority: 'high',
            userId: ORION_ID,
            teamId: team.id,
            assigneeId: ORION_ID
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Operating Systems - Threading Lab',
            description: 'Implement mutex locks and semaphore logic.',
            status: 'todo',
            priority: 'critical',
            userId: ORION_ID,
            teamId: team.id,
            assigneeId: FIXED_USER_ID
        }
    });

    // 5. STRUCTURED COLLABORATION (INTENT-BASED COMMENTS)
    await (prisma.taskComment as any).create({
        data: {
            taskId: task1.id,
            userId: ORION_ID,
            content: 'Performance metrics update. Latency reduced by 12ms.',
            type: 'update'
        }
    });

    const blockedComment = await (prisma.taskComment as any).create({
        data: {
            taskId: task2.id,
            userId: FIXED_USER_ID,
            content: 'I am hitting a race condition in the priority executor. Mutex lock is failing to release.',
            type: 'block'
        }
    });

    await (prisma.taskComment as any).create({
        data: {
            taskId: task2.id,
            userId: ORION_ID,
            content: 'Have you verified the memory barrier alignment?',
            type: 'question'
        }
    });

    // 6. TACTICAL CHAT (ASYNC SQUAD CHANNEL)
    await (prisma as any).squadChat.createMany({
        data: [
            { teamId: team.id, userId: ORION_ID, content: 'Vanguard Alpha, status report.' },
            { teamId: team.id, userId: FIXED_USER_ID, content: 'Operator Alpha active. Working on OS lab task. Encountered a critical block.' },
            { teamId: team.id, userId: ORION_ID, content: 'Acknowledged. I will review the threading logic now.' }
        ]
    });

    // 7. HABITS & PROGRESSION
    const habitsData = [
        { title: 'Deep Work (4 Hours)', streak: 7 },
        { title: 'Neural Hydration (2L)', streak: 15 },
    ];

    for (const h of habitsData) {
        const habit = await prisma.habit.create({
            data: { title: h.title, userId: ORION_ID }
        });

        for (let i = 0; i < h.streak; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setUTCHours(0, 0, 0, 0);
            await prisma.habitLog.create({
                data: { habitId: habit.id, date, completed: true }
            });
        }
    }

    // 8. ACHIEVEMENT DEFINITIONS
    const achievements = [
        { key: 'first_strike', title: 'First Strike', description: 'Complete your first tactical operation.', icon: 'Zap', category: 'ops', target: 1 },
        { key: 'field_agent', title: 'Field Agent', description: 'Successfully conclude 10 distinct operations.', icon: 'Target', category: 'ops', target: 10 },
        { key: 'rank_ascension', title: 'Authority Rank V', description: 'Ascend to Level 5 within the Nexus hierarchy.', icon: 'Trophy', category: 'status', target: 5 },
    ];

    for (const achievement of achievements) {
        await (prisma as any).achievementDefinition.upsert({
            where: { key: achievement.key },
            update: achievement,
            create: achievement
        });
    }

    console.log('--- COLLABORATION SEED COMPLETE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
