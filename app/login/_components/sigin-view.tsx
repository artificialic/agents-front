import Link from 'next/link';
import UserAuthForm from './user-auth-form';

export default function SignInViewPage() {
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="hidden h-full flex-col bg-muted bg-zinc-900 p-10 dark:border-r lg:flex">
        <div className="flex h-full items-center justify-center">
          <img src="./logo.png" className="h-80" alt="Logo" />
        </div>
      </div>
      <div className="flex h-full items-center p-4 lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Inicia sesión en tu cuenta</h1>
            <p className="text-sm text-muted-foreground">Ingresa tu correo y contraseña para iniciar sesión</p>
          </div>
          <UserAuthForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="underline underline-offset-4 hover:text-primary">
              Regístrate aquí
            </Link>
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            Al hacer clic en continuar, aceptas nuestros{' '}
            <Link
              href="https://desarrollandoando.com/terminos-y-condiciones_desarrollando-ando-s-a-s/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link
              href="https://desarrollandoando.com/politica-de-tratamiento-de-datos/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
