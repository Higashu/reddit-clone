import nodemailer from 'nodemailer'

export async function sendEmail(to:string, html:string) {

    // const testAccount = await nodemailer.createTestAccount();
    // console.log('testAccount', testAccount);

    const transporter = nodemailer.createTransport({
        host:'smtp.ethereal.email',
        port:587,
        secure:false,
        auth:{
            user:'wcb33lmo4jxeolzw@ethereal.email',
            pass:'ZkmwJ5WXJS3XzZbVGu',
        },
    });

    const info = await transporter.sendMail({
        from:'"Fred Foo 🦘" <foo@example.com>',
        to:to,
        subject:'Change password',
        html,        
    });

    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

}