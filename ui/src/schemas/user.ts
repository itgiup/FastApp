import { Dayjs } from "dayjs";
import { z } from 'zod';

export type LoginState = "LOGGED_OUT" | "LOGGED_IN" | "EXPIRED";

export type LoginResponse = {
    login: {
        accessToken: string;
    };
};

export type LoginVariables = {
    username: string;
    password: string;
};


export const UserErrors = {
    UserClientHasNotInitiated: "User client has not initiated"
}

export interface UserType {
    id: string
    username: string
    email: string
    isActive: boolean
    isSuperuser: boolean
    createdAt: Dayjs
    apiKey?: string
}

// export const UserTypeSchema = z.object({
//     id: z.string(),
//     username: z.string(),
//     email: z.email(),
//     isActive: z.boolean(),
//     isSuperuser: z.boolean(),
//     createdAt: z.instanceof(Dayjs),
//     apiKey: z.string().optional(),
// });


export interface UpdateUserInput {
    email?: string
}


export const UpdateUserInputSchema = z.object({
    email: z.email(),
});


/** **************************************************  */
/** ******************** register ********************  */
export type RegisterMode = 'normal' | 'web3';

// 1. Base field definitions (tái sử dụng được)
const baseFields = {
    username: z
        .string()
        .min(3, 'Username phải có ít nhất 3 ký tự')
        .max(50, 'Username không được quá 50 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ chứa chữ, số và dấu gạch dưới'),

    password: z
        .string()
        .min(8, 'Password phải có ít nhất 8 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password phải có chữ hoa, chữ thường và số'),

    email: z
        .email('Email không đúng định dạng')
        .max(100, 'Email không được quá 100 ký tự'),

    confirmPassword: z.string(),

    terms: z.boolean().refine(val => val === true, 'Bạn phải đồng ý điều khoản'),
};

// 2. Base schema không có refinements phức tạp
const baseRegisterSchema = z.object({
    username: baseFields.username,
    password: baseFields.password,
    email: baseFields.email,
    confirmPassword: baseFields.confirmPassword,
});

// 3. Schema cho Traditional mode (full validation)
export const registerSchemaTraditional = baseRegisterSchema
    .extend({
        terms: baseFields.terms,
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: 'Password không khớp',
            path: ['confirmPassword'],
        }
    )
    .refine(
        async (data) => {
            // Check username uniqueness
            const exists = await checkUsernameExists(data.username);
            return !exists;
        },
        {
            message: 'Username đã tồn tại',
            path: ['username'],
        }
    );

// 4. Schema cho Web3 mode (email optional)
export const registerSchemaWeb3 = z.object({
    username: baseFields.username,
    password: baseFields.password,
    confirmPassword: baseFields.confirmPassword,
    // Email optional hoặc empty string
    email: baseFields.email.optional().or(z.literal('')),
    terms: baseFields.terms,
})
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: 'Password không khớp',
            path: ['confirmPassword'],
        }
    )
    .refine(
        async (data) => {
            const exists = await checkUsernameExists(data.username);
            return !exists;
        },
        {
            message: 'Username đã tồn tại',
            path: ['username'],
        }
    );

// 5. Schema factory pattern (advanced)
const createRegisterSchema = (mode: 'normal' | 'web3') => {
    const baseSchema = z.object({
        username: baseFields.username,
        password: baseFields.password,
        confirmPassword: baseFields.confirmPassword,
        terms: baseFields.terms,
    });

    // Conditional email field
    const schemaWithEmail = mode === 'normal'
        ? baseSchema.extend({ email: baseFields.email })
        : baseSchema.extend({ email: baseFields.email.optional().or(z.literal('')) });

    // Add common refinements
    return schemaWithEmail
        .refine(
            (data) => data.password === data.confirmPassword,
            {
                message: 'Password không khớp',
                path: ['confirmPassword'],
            }
        )
        .refine(
            async (data) => {
                const exists = await checkUsernameExists(data.username);
                return !exists;
            },
            {
                message: 'Username đã tồn tại',
                path: ['username'],
            }
        );
};

// 6. Usage examples
export const schemas = {
    traditional: createRegisterSchema('normal'),
    web3: createRegisterSchema('web3'),
    // Có thể dễ dàng thêm modes khác
};

// 7. Type definitions
export type RegisterDataTraditional = z.infer<typeof schemas.traditional>;
export type RegisterDataWeb3 = z.infer<typeof schemas.web3>;

// 8. Validation helpers
export const validateRegister = async (data: unknown, mode: 'normal' | 'web3') => {
    const schema = schemas[mode];
    return await schema.safeParseAsync(data);
};

// 9. Partial schemas cho từng bước (nếu có multi-step form)
export const stepSchemas = {
    step1: z.object({
        username: baseFields.username,
        email: baseFields.email.optional().or(z.literal('')),
    }),

    step2: z.object({
        password: baseFields.password,
        confirmPassword: baseFields.confirmPassword,
    }).refine(
        (data) => data.password === data.confirmPassword,
        {
            message: 'Password không khớp',
            path: ['confirmPassword'],
        }
    ),

    step3: z.object({
        terms: baseFields.terms,
    }),
};

// 10. Utility functions
export const getFieldValidation = (field: keyof typeof baseFields) => {
    return baseFields[field];
};

// Mock function - replace with actual implementation
async function checkUsernameExists(username: string): Promise<boolean> {
    // API call to check username
    return false;
}

// Zod schema validation
export const registerSchema = z.object({
    username: z
        .string()
        .min(1, 'Tên đăng nhập không được để trống')
        .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
        .max(20, 'Tên đăng nhập không được quá 20 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới')
        .refine(val => !val.startsWith('_') && !val.endsWith('_'), {
            message: 'Tên đăng nhập không được bắt đầu hoặc kết thúc bằng dấu gạch dưới'
        }),
    email: z
        .email('Email không đúng định dạng')
        .min(1, 'Email không được để trống')
        .max(100, 'Email không được quá 100 ký tự')
        .refine(val => !val.includes('+'), {
            message: 'Email không được chứa ký tự +'
        })
        .refine(val => {
            const domain = val.split('@')[1];
            return domain && !domain.startsWith('.') && !domain.endsWith('.');
        }, {
            message: 'Tên miền email không hợp lệ'
        }),
    password: z
        .string()
        .min(1, 'Mật khẩu không được để trống')
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(50, 'Mật khẩu không được quá 50 ký tự')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
            message: 'Mật khẩu phải chứa ít nhất: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
        }),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    agreeTerms: z.boolean().refine(val => val === true, {
        message: 'Bạn phải đồng ý với điều khoản sử dụng'
    })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
});
